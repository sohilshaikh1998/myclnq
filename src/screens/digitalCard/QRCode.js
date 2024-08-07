import React, { useRef } from 'react';
import { Platform, StyleSheet, Touchable, TouchableOpacity } from 'react-native';
import { View, Text, Image } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AppColors } from '../../shared/AppColors';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { moderateScale } from '../../utils/Scaling';
import ElevatedView from 'react-native-elevated-view';
import ViewShot from 'react-native-view-shot';
import { AppStyles } from '../../shared/AppStyles';

const QRCODE = ({ employeeName, companyName, digitalID, viewShotRef }) => {
  return (
    <ViewShot ref={viewShotRef}>
      <ElevatedView style={styles.qrCodeBg} elevation={10}>
        <View style={styles.qrCodeHeader}>
          <Image source={require('../../../assets/images/myclnq_logo.png')} />
          <Text style={styles.qrCodeHeaderText}>MyCLNQ</Text>
        </View>

        <View style={styles.companyHeaderBg}>
          <Image source={require('../../../assets/images/medical_logo.png')} />
          <View style={{ marginHorizontal:  20 }}>
            <Text style={styles.qrCompanyText}>MyCLNQ Digital Pass</Text>
          </View>
        </View>

        <View style={styles.secondaryContainer}>
          <Text style={styles.companyName}>
            {companyName && companyName.toUpperCase()}
          </Text>
          
          <Text style={styles.employeeName}>{employeeName}</Text>
        </View>

        <View style={styles.qrCodeContainer}>
          <QRCode
            value={digitalID}
            size={Platform.OS === 'ios' ? 130 : 120} 
            color="black" 
            backgroundColor="white" 
            onError={error=>{
            console.log(error,"error")
            }}
            // logo={require('../../../assets/images/myclnq_logo.png')}
          />
          
        </View>
        <View style={styles.uniqueIdContainer}>
          <Text style={styles.qrCodeNum}>{digitalID}</Text>
        </View>
      </ElevatedView>
    </ViewShot>
  );
};

const styles = StyleSheet.create({
  qrCodeBg: {
    backgroundColor: AppColors.primaryColor,
    height: Platform.OS === 'ios' ? hp(58) : hp(62),
    width: wp(90),
    margin: moderateScale(15),
    borderRadius: 6,
  },
  qrCodeHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(8),
    marginLeft: moderateScale(20),
  },
  qrCodeContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.whiteColor,
    marginHorizontal: wp(26),
    height: Platform.OS ==='android'? hp(18): hp(18),
    borderRadius: 6,
    marginTop:hp(5)
  },

  qrCodeHeaderText: {
    fontSize: 20,
    color: AppColors.backgroundGray,
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: Platform.OS === 'android' ? '600' : '700',
    fontFamily: AppStyles.fontFamilyBoldOpenSans,
    marginLeft: 10,
  },
  companyHeaderBg: {
    display: 'flex',
    backgroundColor: '#ffcccb',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: hp(14),
    width: wp(90),
    padding: 20,
  },
  qrCodeNum: {
    fontSize: 18,
    color: AppColors.backgroundGray,
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: Platform.OS === 'android' ? '600' : '700',
    fontFamily: AppStyles.fontFamilyBoldOpenSans
  },
  qrCompanyText: {
    fontSize: 24,
    color: AppColors.blackColor,
    fontWeight: '600',
    fontFamily: AppStyles.fontFamilyBoldOpenSans
  },
  secondaryContainer: {
    display: 'flex',
    alignSelf: 'flex-start',
    marginLeft: moderateScale(20),
    marginTop: hp(2),
  },
  employeeName: {
    color: AppColors.whiteColor,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: AppStyles.fontFamilyBoldOpenSans
  },
  companyName: {
    color: AppColors.whiteColor,
    fontSize: 18,
    fontFamily: AppStyles.fontFamilyOpenSansSemiBold,
  },
  uniqueIdContainer: {
    marginTop: 10,
  },
});

export default QRCODE;
