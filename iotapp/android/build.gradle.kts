allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// Config خاص بالـ build directory
val newBuildDir = rootProject.layout.buildDirectory.dir("../../build").get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}

subprojects {
    project.evaluationDependsOn(":app")
}

// clean task
tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
// android/build.gradle.kts

buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        // مهم برشا باش يخدم Firebase
        classpath("com.android.tools.build:gradle:8.2.2")
        classpath("com.google.gms:google-services:4.3.15")
    }
}
