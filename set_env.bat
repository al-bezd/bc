set ANDROID_HOME=C:\Users\acer\AppData\Local\Android 3.5.3\Sdk
set ANDROID_SDK_ROOT=C:\Users\acer\AppData\Local\Android 3.5.3\Sdk
set JAVA_HOME=C:\Program Files\ojdkbuild\java-1.8.0-openjdk-1.8.0.332-1
set OJDKBUILD_JAVA_HOME=C:\Program Files\ojdkbuild\java-1.8.0-openjdk-1.8.0.332-1\
set PATH=%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
set PATH=%PATH%;%JAVA_HOME%\bin;

$env:ANDROID_HOME = "C:\Users\acer\AppData\Local\Android 3.5.3\Sdk"
$env:ANDROID_SDK_ROOT = "C:\Users\acer\AppData\Local\Android 3.5.3\Sdk"
$env:PATH += ";$env:ANDROID_HOME\tools;$env:ANDROID_HOME\platform-tools"

jabba менеджер java билдов (используется для смены версии)
в текущем проекте приоритетно использовать java-1.8.0
желательно использовать андроид версии Android 3.5.3