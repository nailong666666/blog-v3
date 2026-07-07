---
title: Java基础
description: 补一下Java的知识
date: 2026-06-22 14:38:15
updated: 2026-06-22 14:38:15
image: /2026/Java基础/cover.jpg
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
class Demo {

// 这是一个单行注释

/*
这是一个多行注释
可以用来注释多行代码
*/

/**
 * 这是一个文档注释示例
 * 它通常包含有关类、方法或字段的详细信息
 */

    System.out.println("Hello");
}
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

在java中，引用类型的变量类似于C++中的指针，引用类型变量存放的不是对象本身，而是对象在内存中的地址。引用类型默认值是**null**。类和数组等都是引用类型。

``` java
int[] arr = {1, 2, 3};                                         

String str = "Hello";
Student stu = new Student();
```



### 3.  数组

#### 1.  声明数组

在程序中首先必须声明数组变量，才能使用数组。下面是声明数组变量的语法：

```java
dataType[] arrayRefVar;
int[] a;
```

#### 2.  创建数组

在java中，用**new**去创建数组。下面是创建数组的语法：

```java
arrayRefVar = new dataType[arraySize];                             // 先new了一个数组，然后赋值给变量
```

当然也可以直接声明并创建数组。

```java
dataType[] arrayRefVar = new dataType[arraySize];

dataType[] arrayRefVar = {value0, value1, ..., valuek};
```

#### 3.  For-Each 循环

JDK 1.5 引进了一种新的循环类型，被称为 For-Each 循环或者加强型循环，它能在不使用下标的情况下遍历数组。语法是：

```java
for(type element: array)
{
    System.out.println(element);
}
```

实例：

```java
public class TestArray {
   public static void main(String[] args) {
      double[] myList = {1.9, 2.9, 3.4, 3.5};
 
      // 打印所有数组元素
      for (double element: myList) {
         System.out.println(element);
      }
   }
}
```



### 4.  循环结构

#### 1.  For循环

语法：

```java
for(初始化; 布尔表达式; 更新) {
    //代码语句
}
```

实例：

```java
public class test{
    public static void main(String[] args){
        for(int i = 0; i < 10; i++){
            System.out.println( x );
        }
    }
}
```

#### 2.  While循环

语法：

```java
while( 布尔表达式 ) {
  //循环内容
}
```

实例：

```java
public class test {
   public static void main(String[] args) {
      int x = 10;
      while( x < 20 ) {
         System.out.println( x );
         x++;
      }
   }
}
```

#### 3.  Do-While循环

do-while循环相比于while循环会先执行一遍循环内容再进入判断。语法：

```java
do {
       //代码语句
}while(布尔表达式);
```

实例：

```java
public class test {
   public static void main(String[] args){
      int x = 10;
 	  do{
         System.out.println( x );
         x++;
      }while( x < 20 );
   }
}
```

#### 4.  break和continue

break 主要用在循环语句或者 switch 语句中，用来跳出整个语句块。break 跳出最里层的循环，并且继续执行该循环下面的语句。

continue 适用于任何循环控制结构中。作用是让程序立刻跳转到下一次循环的迭代。在 for 循环中，continue 语句使程序立即跳转到更新语句。在 while 或者 do…while 循环中，程序立即跳转到布尔表达式的判断语句。

### 5.  正则表达式

#### 1.  java.util.regex 包

#### 2.  

#### 3.  语法

#### 4.  

#### 5.  

#### 6.  



### 6.  输出

#### 1.  `System.out.print()` 

输出，不换行

```java
System.out.print("Hello");
System.out.print("World");

//输出
HelloWorld
```

#### 2.  `System.out.println()` 

输出后换行

```java
System.out.println("Hello");
System.out.println("World");

//输出
Hello
World
```

#### 3.  `System.out.printf()`

 格式化输出

```java
String name = "Tom";
int age = 18;
System.out.printf("姓名：%s，年龄：%d", name, age);

//输出
姓名：Tom，年龄：18
```

#### 4.  输出多个内容

```java
String name = "Tom";
int age = 18;
System.out.println("姓名：" + name + " 年龄：" + age);

//输出
姓名：Tom 年龄：18
```



