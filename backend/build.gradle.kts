plugins {
    kotlin("jvm") version "2.2.20"
    kotlin("plugin.serialization") version "2.2.20"
    id("io.ktor.plugin") version "3.6.1"
    id("io.gitlab.arturbosch.detekt") version "1.23.8"
    application
}

group = "calendar"
version = "0.0.1"

application {
    mainClass.set("calendar.ApplicationKt")
}

repositories {
    mavenCentral()
}

dependencies {
    // Ktor: версии приходят из BOM плагина io.ktor.plugin.
    implementation("io.ktor:ktor-server-core")
    implementation("io.ktor:ktor-server-netty")
    implementation("io.ktor:ktor-server-content-negotiation")
    implementation("io.ktor:ktor-serialization-kotlinx-json")
    runtimeOnly("ch.qos.logback:logback-classic:1.5.18")

    testImplementation("io.ktor:ktor-server-test-host")
    testImplementation(kotlin("test"))

    detektPlugins("io.gitlab.arturbosch.detekt:detekt-formatting:1.23.8")
}

kotlin {
    jvmToolchain(21)
    compilerOptions {
        allWarningsAsErrors.set(true)
    }
}

detekt {
    buildUponDefaultConfig = true
}

tasks.test {
    useJUnitPlatform()
}
