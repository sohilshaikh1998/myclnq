# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}
-keep class us.zoom.** { *; }
-keep class us.zipow.** { *; }
-keep class com.zipow.** { *; }
-keep class org.webrtc.** { *; }
-dontwarn us.zoom.**
-dontwarn com.zipow.**
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.devsupport.** { *; }
-keep public class com.horcrux.svg.** {*;}
-dontwarn com.facebook.react.devsupport.**