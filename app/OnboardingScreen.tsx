import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
      source={require('../assets/images/7441533.jpg') }
      />
      <Text style={styles.title}>Welcome to the App!</Text>
      <Text style={styles.subtitle}>
        Discover and book your services easily.
      </Text>
      {/* <View style={{flex:1, width:'100%',flexDirection:'row', justifyContent:'center',alignItems:'center' }}>
        <Image
          source={require("../assets/images/onbor.jpg")}
          style={{
            width: 100,
            height: 100,

            // resizeMode: "contain",
          }}
        />
        <Image
          source={require("../assets/images/4011476.jpg")}
          style={{
            width: 100,
            height: 100,

            // resizeMode: "contain",
          }}
        />
      </View>
      <Image
        source={require("../assets/images/7441533.jpg")}
        style={{
          width: "100%",
          height: 100,

          resizeMode: "contain",
        }}
      /> */}
      <View style={{ flexDirection: "row", padding: 10 }}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28, marginBottom: 10, fontFamily: 'BungeeInline'
  },
  subtitle: {
    fontSize: 20,
    color: "#555",
    marginBottom: 40,
    textAlign: "center",
    fontWeight: '400',
    fontFamily: 'AlexBrush'
  },
  loginButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fdb7cf",
    borderRadius: 15,
    marginBottom: 20,
    width: 150,
    height: 60,
    marginRight: 10,
  },
  loginText: { color: "#fff", fontSize: 20, fontFamily: 'BungeeInline' },
  registerButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: 15,
    marginBottom: 20,
    borderColor: '#fdb7cf',
    width: 150,
    height: 60,
  },
  registerText: { color: "#fdb7cf", fontSize: 20, fontFamily: 'BungeeInline' },
});
