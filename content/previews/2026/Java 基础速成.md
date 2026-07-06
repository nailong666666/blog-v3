---
title: Java 基础速成
description: 补一下Java的知识
date: 2026-06-22 14:38:15
updated: 2026-06-22 14:38:15
image: /2026/Java 基础速成/cover.jpg
categories: [技术]
---

## Java  简介 

**Java** 是一种面向对象、跨平台、强类型的高级编程语言。通常是通过`javac`将`.java`源码编译成`.class`字节码，再交由`JVM`运行。

## Java  包和导包

###  1.  源文件命名

Java源文件命名要严格和文件中类的名字相同，且区分大小写。	

### 2.  package

**package**是对Java文件进行分类管理，写在源文件首行，通常是该文件的路径，例如：

```text
com
└── test
    └── demo
        └── Main.java
```
那么Main.java就应该是

```java
package com.test.demo;
public class Main{
    public static void main(String[] args){
        System.out.println("Hello");
    }
}
```

### 3.  import

 **import**是用来导入已经写好的类，可以导入具体的类或者某个包下所有的类。

```java
import com.test.demo.Main;								 //导入Main类
import com.test.demo.*;									 //导入demo包中所有的类
```

## Java  注释

```java
// 这是一个单行注释

/*
这是一个多行注释
可以用来注释多行代码
*/

/**
 * 这是一个文档注释示例
 * 它通常包含有关类、方法或字段的详细信息
 */
```

## Java  基础语法

### 1.  基本数据类型

| 类型        | 默认值     | 示例               |
| ----------- | ---------- | ------------------ |
| **byte**    | 0          | `byte a = 44`      |
| **short**   | 0          | `short a = 33`     |
| **int**     | 0          | `int a = 11`       |
| **long**    | 0L         | `long a = 22L`     |
| **float**   | 0.0F       | `float a = 55.6F`  |
| **double**  | 0.0D       | `double a = 11.6D` |
| **boolean** | **false**  | `boolean a = true` |
| **char**    | **\u0000** | `char a = 'p'`     |

### 2.  引用类型

