import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'

const IntroScreen = () => {
    return (
        <View   >
            <ImageBackground source={require('../assets/images/backgourd.png')}   className=" w-full h-full flex items-center justify-center ">
            <Image style={{ borderRadius:100, borderColor:"white",  width:400, height:400}} source={require('../assets/images/logo2.png')} />
            <Text  style={{ fontFamily:'Fascinate',  fontSize:30, textAlign:'center',color:"#fff", marginTop:20}}>Beauty Marco</Text>
            </ImageBackground>
        </View>
    )
}

export default IntroScreen

const styles = StyleSheet.create({})