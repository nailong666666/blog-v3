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

在java中，引用类型的变量类似于C++中的指针，引用变量保存的是 **对象的引用** 。引用类型默认值是**null**。类和数组等都是引用类型。

```java
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
for (type element : array)
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
public class Test {
    public static void main(String[] args){
        for(int i = 0; i < 10; i++){
            System.out.println( i );
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
public class Test {
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
public class Test {
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

### 5.  输出

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

## Java  正则表达式

### 1.  java.util.regex 包

`java.util.regex` 是 Java 标准库中专门用于正则表达式处理的包，主要负责字符串的匹配、查找、替换、分割等操作，该包一共有三个类。

#### 1.  Pattern 类：

Pattern 对象是一个正则表达式的编译表示。

实例：

```java
import java.util.regex.Pattern;

Pattern pattern = Pattern.compile("\\d+");                   //pattern类没有构造函数，可以使用静态方法compile()来编译正则表达式。

Matcher m = pattern.matcher("123abc");                       //创建 Matcher 对象

boolean result = Pattern.matches("\\d+", "12345");           //直接判断整个字符串是否匹配
```



#### 2.  Matcher 类：

Matcher 对象是对输入字符串进行解释和匹配操作的引擎。

实例：

```java
import java.util.regex.Matcher;

// 要求整个字符串都符合正则。matches()
Pattern p = Pattern.compile("\\d+");
Matcher m = p.matcher("123");
System.out.println(m.matches());

// 查找下一段符合规则的内容。find()
Pattern p = Pattern.compile("\\d+");
Matcher m = p.matcher("abc123xyz456");
while(m.find()){
    System.out.println(m.group());
}

// 返回最近一次匹配到的内容。group()
Matcher m = p.matcher("abc123");
m.find();
System.out.println(m.group());
```



#### 3.  PatternSyntaxException 类：

PatternSyntaxException表示一个正则表达式模式中的语法错误。

### 2.  捕获组

捕获组是Java 正则表达式中非常重要的概念，用于**将匹配到的某一部分内容保存起来，以便后续获取或引用**。

实例：

```java
import java.util.regex.*;

public class Test {
    public static void main(String[] args) {

        Pattern p = Pattern.compile("(\\d+)");
        Matcher m = p.matcher("abc123xyz");

        if (m.find()) {
            System.out.println(m.group());
            System.out.println(m.group(1));
        }
    }
}

// 输出
123
123
// group()等价于group(0),表示整个正则表达式匹配到的内容。
    
// groupCount()  查看有多少个捕获组。

Pattern p = Pattern.compile("(\\d+)-([a-z]+)");
Matcher m = p.matcher("123-abc");

System.out.println(m.groupCount());

// 输出
2
// groupCount() 不包括 group(0)。

```

### 3.  语法

在Java 中，`\\ `表示：插入一个正则表达式的反斜线，使其后的字符具有特殊的意义。在其他语言中，只需要一个` \` 就能表示转义的作用，而在Java 中，要有两个 `\\ `。

#### 1.  普通字符

普通字符表示**按字面意思匹配**。例如正则`a`匹配字符 a 。

#### 2.  元字符

元字符具有特殊含义。

##### 1.  点号`.`

匹配**任意一个字符**（默认不包括换行符）。例如正则`a.e`可以匹配ase afe a2e等。

##### 2.  转义符 `\`

用于取消元字符的特殊含义。例如正则`\.` `\\`分别匹配 . \ 。

##### 3.   常见转义字符

| 正则 | 含义                           |
| :--- | :----------------------------- |
| `\d` | 数字 `[0-9]`                   |
| `\D` | 非数字                         |
| `\w` | 单词字符（字母、数字、下划线） |
| `\W` | 非单词字符                     |
| `\s` | 空白字符（空格、Tab、换行等）  |
| `\S` | 非空白字符                     |
| `\t` | Tab                            |
| `\n` | 换行                           |
| `\r` | 回车                           |

#### 3.  字符类

##### 1.  基本字符类

正则`[abc]`匹配a 或 b 或 c 。

##### 2.  范围

| 正则          | 含义           |
| :------------ | :------------- |
| `[a-z]`       | 所有小写字母   |
| `[A-Z]`       | 所有大写字母   |
| `[0-9]`       | 数字           |
| `[a-z0-9A-Z]` | 所有字母和数字 |

##### 3.  取反

`[^abc]` 表示不是 a 、b 、c的。

#### 4.  量词

控制匹配次数。

| 正则    | 含义       |
| :------ | :--------- |
| `*`     | 0 次或多次 |
| `+`     | 1 次或多次 |
| `?`     | 0 次或1 次 |
| `{n}`   | 恰好 n 次  |
| `{n,}`  | 至少 n 次  |
| `{n,m}` | n~m 次     |

#### 5.  边界匹配

| 正则 | 含义           |
| ---- | -------------- |
| `^`  | 匹配开头       |
| `$`  | 匹配结尾       |
| `\b` | 匹配单词边界   |
| `\B` | 匹配非单词边界 |

### 

## Java  类与对象

Java 中类与对象和 C++ 较为相似，直接通过一个实例去学习。

```java
public class Student{
    public String name;
    public int age;

    public Student(String name, int age){
        this.name = name;
        this.age = age;
    }

    public void Setname(String name){
        this.name = name;
    }

    public void Setage(int age){
        this.age = age;
    }

    public static void main(String[] args){
        Student s1 = new Student(" ",0);
        System.out.println(s1.name+" "+s1.age);

        s1.Setname("nailong");
        s1.Setage(10);
        System.out.println(s1.name+" "+s1.age);
    }
}

```





## Java  关键字

### 1.  new

`new` 用于**创建对象**，在堆内存中分配空间，并调用对象的构造方法完成初始化。

### 2.  this

`this` 表示**当前对象本身**。哪个对象调用方法，`this` 就代表哪个对象。

### 3.  static

`static` 表示**属于类，而不是属于对象**。`static`修饰成员变量表示该成员变量是该类的；静态方法要访问普通成员，必须要先创建对象。

### 4.  final 

`final` 表示不可改变。修饰变量不可再次赋值，修饰方法不能重写，修饰类不能继承。

### 5.  extends

`extends` 表示子类继承父类。子类自动拥有父类的属性和方法。Java 中只能继承一个类。

### 6.  super 

`super` 表示父类。

### 7.  abstract

`abstract`表示抽象，用于修饰抽象类和抽象方法。当有抽象方法时，抽象方法不能实现，该类就是抽象类。子类必须实现抽象方法，或者继续保持抽象，抽象类不能创建对象。

### 8.  interface 

`interface` 表示接口，是一种规范。

```java
interface Fly{

    void fly();

}
```

### 9.  implements

`implements` 表示实现接口。一个类可以实现多个接口。

```java
interface Fly{

    void fly();

}

class Bird implements Fly{

    public void fly(){

        System.out.println("飞");

    }

}
```

### 10.  instanceof

`instanceof` 表示判断对象是否属于某个类或接口。

```java
Animal a = new Dog();

System.out.println(a instanceof Dog);

// 输出
true
```



## Java  继承和多态

Java 中继承和多态与 C++ 有类似的，这里用一个实例学习。

```java
public class Student {
    public String name;
    public String sex;

    public Student(String s1,String s2){
        this.name = s1;
        this.sex = s2;
    }

    public void Getsex(){
        System.out.println("性别："+sex);
    }

    public static void main(String[] args){
        System.out.println("父类");
    }
}

class man extends Student{
    public man(String s1){
        super(s1,"man");
    }

    public void Getsex(){
        System.out.println("性别：man");
    }

    public static void main(String[] args) {
        System.out.println("子类");
        man man1 = new man("小明");
        man1.Getsex();
    }
}

class woman extends Student{
    public woman(String s1){
        super(s1,"woman");
    }

    public void Getsex(){
        System.out.println("性别：woman");
    }

    public static void main(String[] args) {
        System.out.println("子类");
        woman woman1 = new woman("小红");
        woman1.Getsex();
    }
}

class Test {
    public static void main(String[] args) {

        Student s1 = new man("小明");
        Student s2 = new woman("小红");

        s1.Getsex();
        s2.Getsex();

    }

}

```

与 C++ 不同的是，Java只支持继承一个类，要想继承多个，可以通过类继承接口的方式。







## Java  异常处理

### 1.  类结构

Java 中有关异常处理的类都位于 **java.lang** 包中。根类是**Throwable**，它由两个子类，**Error**和**Exception**。前者是错误，表示 **JVM 或系统级错误**。后者是异常，又分为两大类：**RuntimeException** （非受检异常，编译器不会强制处理）和 **非 RuntimeException** （受检异常，编译器要求必须处理）。

### 2.  关键字和类

Java 提供了一些关键字和类去处理异常。

- **try**：用于包裹可能会抛出异常的代码块。
- **catch**：用于捕获异常并处理异常的代码块。
- **finally**：用于包含无论是否发生异常都需要执行的代码块。
- **throw**：用于手动抛出异常。
- **throws**：用于在方法声明中指定方法可能抛出的异常。
- **Exception**类：是所有异常类的父类，它提供了一些方法来获取异常信息，如 **getMessage()、printStackTrace()** 等。






## Java  集合框架

Java 集合框架是 Java 提供的一套用于存储和管理对象的统一容器体系，位于 `java.util` 包中。分为**Collection（单列集合）**和**Map（双列集合）**。

这里对泛型进行一个介绍，它允许在定义类、接口、方法时使用类型参数，从而实现代码复用、类型安全、减少强制类型转换。这里用一个泛型类学习。

```java
class Box<T>{
    private T value;

    public void set(T value){
        this.value = value;
    }

    public T get(){
        return value;
    }
}
```



### 1.  Collection

Collection 是所有单列集合的根接口，由它继承出了许多接口，这里学习一下**List**和**Set**两个。

List 集合是有序的、可以重复的、有索引的接口，以**ArrayList**具体实现为例。Set集合是无重复元素、无索引的接口，以**HashSet**具体实现为例。

```java

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Test {
    public static void main(String[] args) {

        // List接口
        List<String> list = new ArrayList<String>();
        list.add("a");
        list.add("b");
        list.add("c");
        for(String s: list){
            System.out.println(s);
        }
        System.out.println("list");

        // Set接口
        Set<String> set = new HashSet<String>();
        set.add("a");
        set.add("a");
        set.add("b");
        set.add("b");
        set.add("c");
        set.add("c");
        for(String s: set){
            System.out.println(s);
        }
        System.out.println("Set");
    }

}


```



### 2.  Map

map 是双列的，按照键值对的形式存储。这里以**HashMap**为例。

```java
import java.util.Map;
import java.util.HashMap;
import java.util.Set;

public class Test {
    public static void main(String[] args) {

        // 这里要用int的包装类
        Map<String,Integer> student = new HashMap<String,Integer>();
        student.put("小张",12);
        student.put("小王",19);
        student.put("小明",15);

        // Map的遍历要先获得键Set，然后遍历键
        Set<String> name = student.keySet();
        for (String key : name) {
            Integer value = student.get(key);
            System.out.println(key+":"+value);
        }
    }
}


```

Java 为每个基本类型都提供了对应的**包装类**。

| 基本类型 | 包装类    |
| -------- | --------- |
| int      | Integer   |
| double   | Double    |
| char     | Character |
| boolean  | Boolean   |
| long     | Long      |
| float    | Float     |
| short    | Short     |
| byte     | Byte      |



## Java  IO流

- **Input（输入）**：把数据读到程序里
- **Output（输出）**：把程序里的数据写出去

**IO流** 可以分为字节流和字符流两类，字节流一切数据都可以操作，字符流专门处理文本。以文件流举例。

```java
// FileReader
FileReader fr = new FileReader("a.txt");

int ch;

while((ch = fr.read()) != -1){
    System.out.print((char)ch);
}

fr.close();

// FileWriter
FileWriter fw = new FileWriter("a.txt");

fw.write("Hello Java");

fw.close();

```



## Java  注解









## Java  反射







## Java  序列化与反序列化









## Java  类加载机制





## Java 动态代理





## Servlet 基础





## Maven 基础

