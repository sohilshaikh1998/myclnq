import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';

import { AppColors } from '../../shared/AppColors';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import ElevatedView from 'react-native-elevated-view';
import WalletManager from 'react-native-wallet-manager';
import { strings } from '../../locales/i18n';
import { AppUtils } from '../../utils/AppUtils';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppStyles } from '../../shared/AppStyles';
import { Actions } from 'react-native-router-flux';
import AntDesign from 'react-native-vector-icons/AntDesign';
import QRCODE from './QRCode';
import { SHApiConnector } from '../../network/SHApiConnector';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import ProgressLoader from 'rn-progress-loader';

const passIdentifier = 'pass.co.myclnq.com.ssivixlab.MYCLNQ';

const DigitalCard = () => {
  const [walletHeader, setWalletHeader] = useState('Add To Wallet');
  const [employeeName, setEmployeeName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [digitalID, setDigitalID] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const viewShotRef = useRef(null);

  useEffect(() => {
    fetchDigitalPass();
  }, []);

  const fetchDigitalPass = async () => {
    setLoading(true);
    await SHApiConnector.getDigitalCardData()
      .then((response) => {
        console.log(response.data, 'response');
        if (response.status === 200) {
          setEmployeeName(response?.data?.data?.employee?.name);
          setCompanyName(response?.data?.data?.employee?.company);
          setDigitalID(response?.data?.data?.employee?.digitalId.toString());
          setEmployeeId(response?.data?.data?.employee?._id);
        } else {
          Alert.alert('', 'Something went wrong', [
            {
              text: strings('doctor.button.ok'),
              onPress: () => {
                Actions.MainScreen();
              },
            },
          ]);
        }
      })
      .catch((error) => {
        console.log(error, 'error in fetching data');
        Alert.alert('', 'Something went wrong', [
          {
            text: strings('doctor.button.ok'),
            onPress: () => {
              Actions.MainScreen();
            },
          },
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const ScreenHeader = () => {
    return (
      <ElevatedView style={styles.headerStyle} elevation={10}>
        <TouchableOpacity onPress={() => Actions.pop()} style={{ flex: 1 }}>
          <Image
            resizeMode={'contain'}
            style={{
              width: wp(8),
              marginLeft: moderateScale(15),
              marginTop: AppUtils.isX ? 40 : moderateScale(5),
            }}
            source={require('../../../assets/images/blackarrow.png')}
          />
        </TouchableOpacity>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>{strings('common.titles.digitalIdCard')}</Text>
        </View>
      </ElevatedView>
    );
  };

  const downloadImg = async (uri) => {
    try {
      const image = CameraRoll.save(uri, 'photo');
      if (image) {
        Alert.alert('', 'Digital Pass Saved', [{ text: strings('doctor.button.ok'), onPress: () => {} }], { cancelable: true });
      }
    } catch (error) {
      console.log('Error copying image:', error);
      Alert.alert('Error', 'Failed to download Pass');
    }
  };

  const takeScreenshot = () => {
    viewShotRef?.current
      ?.capture()
      .then((uri) => {
        downloadImg(uri);
      })
      .catch((error) => {
        console.log(error, 'error Here');
        Alert.alert('', 'Something Went Wrong!!');
      });
  };

  const walletHandler = async () => {
    await SHApiConnector.addDigitalCardToWallet()
      .then(async (result) => {
        console.log(result.data, 'cloudUrl');
        if (result?.data?.data?.cloudUrl) {
          await WalletManager.addPassFromUrl(result?.data?.data?.cloudUrl).then((response) => {
            console.log(response, 'response');
            if (response) {
              Alert.alert('', 'Pass Added to Wallet');
            } else {
              console.log('elseCondition');
            }
          });

        }
      })
      .catch((error) => {
        console.log(error);
        Alert.alert('', 'Something went wrong', [
          {
            text: strings('doctor.button.ok'),
            onPress: () => {
              Actions.MainScreen();
            },
          },
        ]);
      });
  };

  const checkForPassExist = async () => {
    const result = await WalletManager.hasPass(passIdentifier, employeeId);
    console.log(result, 'result');
    if (result) {
      Alert.alert('Pass Already Exist', 'Want to Replace it ?', [
        { text: strings('doctor.button.no'), style: 'cancel' },
        {
          text: strings('doctor.button.yes'),
          onPress: () => {
            removePassFromWallet();
          },
        },
      ]);
    } else {
      walletHandler();
    }
  };

  const removePassFromWallet = async () => [
    await WalletManager.removePass(passIdentifier, employeeId)
      .then((result) => {
        console.log(result, 'removePass');
        if (result) {
          walletHandler();
          // Alert.alert('', 'Pass removed from wallet');
        }
      })
      .catch((error) => {
        console.log(error);
        Alert.alert('', 'Something Went Wrong!!');
      }),
  ];

  return isLoading ? (
    <ProgressLoader testID={'progressLoaderLogin'} visible={isLoading} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
  ) : (
    <View style={styles.container}>
      <ScreenHeader />

      <View style={styles.qrCodeContainer}>
        <QRCODE employeeName={employeeName} companyName={companyName} digitalID={digitalID} viewShotRef={viewShotRef} />

        <View style={styles.btnContainer}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.outlinedBtnContainer} onPress={checkForPassExist}>
              <Image style={{ height: 18, width: 30, marginRight: 5 }} source={require('../../../assets/images/apple_wallet.png')} />
              <Text style={{ color: AppColors.greyColor, fontWeight: 'bold',fontFamily: AppStyles.fontFamilyRegular }}>{walletHeader}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.filledBtnContainer} onPress={takeScreenshot}>
            <AntDesign
              name="download"
              size={24}
              style={{
                color: AppColors.whiteColor,
                marginHorizontal: 5, // Spacing between icon and text
              }}
            />
            <Text style={{ color: 'white', fontWeight: 'bold',fontFamily: AppStyles.fontFamilyRegular }}>Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.whiteColor,
  
  },
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: 'center',
    elevation: 5,
    display: 'flex',
    flexDirection: 'row',
  },
  headerText: {
    color: AppColors.blackColor,
    marginTop: AppUtils.isX ? 40 : Platform.OS === 'ios' ? 16 : verticalScale(0),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 15,
  },
  btnContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: Platform.OS === 'ios' ? '90%' : 'auto',
  },
  headerContainer: {
    display: 'flex',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flex: moderateScale(10),
  },
  qrCodeContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.8,
  },
  outlinedBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.whiteColor, // Background color for the button
    padding: 10,
    borderRadius: 5,
    margin: moderateScale(3),
    borderRadius: 15,
    borderWidth: 1,
    borderColor: AppColors.greyColor,
  },
  filledBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryColor,
    padding: 10,
    borderRadius: 5,
    margin: moderateScale(3),
    borderRadius: 15,
  },
});

export default DigitalCard;
