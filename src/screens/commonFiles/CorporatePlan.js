import React from 'react';
import ElevatedView from 'react-native-elevated-view';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { AppColors } from '../../shared/AppColors';
import { moderateScale, verticalScale } from '../../utils/Scaling';
import { AppStyles } from '../../shared/AppStyles';
import { useState, useEffect } from 'react';
import ProgressLoader from 'rn-progress-loader';
import { SHApiConnector } from '../../network/SHApiConnector';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { AppUtils } from '../../utils/AppUtils';
import { Actions } from 'react-native-router-flux';
import { strings } from '../../locales/i18n';
import SHButtonDefault from '../../shared/SHButtonDefault';

const CorporatePlan = () => {
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Sorry something went wrong !');
  const [myPlan, setMyPlan] = useState('');

  useEffect(() => {
    getCorporatePlan();
  }, []);

  const getCorporatePlan = async () => {
    setLoading(true);
    await SHApiConnector.getUserCorporatePlan()
      .then((response) => {
        if (response.data.status == 'success') {
          console.log('CorporatePlan.js: PlanCheck', JSON.stringify(response.data));
          if (response.data.data.package.servicesOffered.length == 0) {
            setMyPlan('');
            setErrorMessage('No Plans Yet !');
          } else {
            setMyPlan(response.data.data.package);
          }
        } else {
          console.log('CorporatePlan.js: PlanCheck', JSON.stringify(response.data));
          setErrorMessage(response.data.message);
        }
        setLoading(false);
      })
      .catch((error) => console.error('CorporatePlan.js: Error in fetching Plan', error))
      .finally(() => setLoading(false));
  };

  const onRefresh = () => {
    getCorporatePlan();
  };

  const corporateHandler = () => {
    Actions.DigitalCard();
  };

  return isLoading ? (
    <ProgressLoader testID={'progressLoaderLogin'} visible={isLoading} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
  ) : myPlan == '' ? (
    <NoPlanMessage errorMessage={errorMessage} onRefresh={onRefresh} />
  ) : (
    <View style={styles.screenContainer}>
      <PlanHeader onRefresh={onRefresh} />
      <ScrollView>
        <View
          style={{
            margin: 20,
            paddingBottom: Platform.OS == 'ios' ? 100 : 50,
          }}
        >
          <PackageCard myPackage={myPlan} />
        </View>
      </ScrollView>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginBottom: 12,
        }}
      >
        <SHButtonDefault
          style={styles.btnStyle}
          btnText="View Digital Card"
          btnTextColor={AppColors.whiteColor}
          btnType={'normal'}
          onBtnClick={() => corporateHandler()}
        />
      </View>
    </View>
  );
};

const PlanHeader = ({ onRefresh }) => {
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
      <View
        style={{
          flex: 3,
          alignSelf: 'center',
          alignItem: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={styles.headerText}>{strings('common.titles.corporatePlan')}</Text>
      </View>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => onRefresh()}>
        <Image
          source={require('../../../assets/images/refresh_button.png')}
          style={{
            width: 20,
            height: 20,
            marginRight: moderateScale(15),
            marginTop: AppUtils.isX ? 40 : moderateScale(5),
            tintColor: AppColors.primaryColor,
            alignSelf: 'flex-end',
          }}
        />
      </TouchableOpacity>
    </ElevatedView>
  );
};

const NoPlanMessage = ({ errorMessage, onRefresh }) => {
  return (
    <View>
      <PlanHeader onRefresh={onRefresh} />
      <View
        style={{
          width: wp(80),
          height: hp(50),
          marginRight: moderateScale(5),
          marginLeft: moderateScale(5),
          justifyContent: 'center',
          alignItem: 'center',
          alignSelf: 'center',
        }}
      >
        <Image
          source={require('../../../assets/images/cancel.png')}
          style={{
            justifyContent: 'center',
            alignSelf: 'center',
            height: verticalScale(100),
            width: moderateScale(100),
          }}
        />
        <Text
          style={{
            color: AppColors.primaryColor,
            fontSize: moderateScale(15),
            textAlign: 'center',
            fontFamily: AppStyles.fontFamilyBold,
          }}
        >
          {errorMessage}
        </Text>
      </View>
    </View>
  );
};

const PackageCard = ({ myPackage }) => {
  return (
    <View>
      <ElevatedView
        elevation={3}
        style={{
          backgroundColor: AppColors.whiteChange,
          borderRadius: 15,
          marginBottom: 20,
        }}
      >
        <View style={[styles.cardHeader]}>
          <Text
            style={{
              color: AppColors.whiteColor,
              fontSize: 22,
              paddingHorizontal: 10,
              textAlign: 'center',
              fontFamily: AppStyles.fontFamilyBold,
            }}
          >
            {myPackage.title == null ? 'No Data' : myPackage.title}
          </Text>
        </View>
        <View style={{ marginHorizontal: 15, marginVertical: 20 }}>
          <View style={styles.itemsView}>
            <Text style={styles.details}>Status</Text>
            <Text style={[myPackage.isActive == true ? { color: AppColors.greenColor2, fontWeight: '600' } : { color: AppColors.grey }, styles.info]}>
              {myPackage.isActive == null ? 'Not Available' : 'Active'}
            </Text>
          </View>
          <View style={styles.companyContainer}>
            <Text style={styles.details}>Company Name</Text>

            <Text style={styles.companyName} numberOfLines={2} ellipsizeMode="tail">
              {myPackage.company.companyName == null ? 'Not Available' : myPackage.company.companyName}
            </Text>
          </View>
          <View style={styles.dividerVital}></View>
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 5, paddingBottom: 20 }}>
              <Text style={styles.details}>Selected Feature</Text>
              <Text style={styles.details}>Attempts Left</Text>
           
            </View>
            {myPackage.servicesOffered.map((feature, index) => (
              <MyFeatures key={index} feature={feature} />
            ))}
          </View>
        </View>
      </ElevatedView>
    </View>
  );
};

const MyFeatures = ( {feature }) => {
  console.log(feature, 'feature');


  const subFeatureName = feature.subFeatures.map((item) => item.name);

  return (
    <View>
      <View style={[styles.featuresView]}>
        <Text style={styles.featureInfo}>{feature.feature.name}</Text>
        
        <Text style={styles.attemptsInfo}>{feature.isUnlimited ? 'Unlimited' : feature.attempts}</Text>


      </View>

    
      {subFeatureName?.map(item=>(
        <View style={[styles.featuresView]}>

           <Text style={styles.subFeatureInfo}>
          {item.toString()}
        </Text>
        <Text style={styles.attemptsInfo}>{feature.isUnlimited ? 'Unlimited' : feature.attempts}</Text>
        </View>
     
      ))}

  
   
     
    </View>
  );
};


const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: AppColors.whiteColor,
  },
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 5,
    flexDirection: 'row',
  },
  headerText: {
    color: AppColors.blackColor,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: AppUtils.isX ? 40 : Platform.OS === 'ios' ? 16 : verticalScale(0),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
  cardHeader: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: AppColors.primaryColor,
  },
  itemsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  companyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuresView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    // backgroundColor:'red'
  },
  details: {
    color: AppColors.blackColor,
    fontSize: 18,
    fontFamily: AppStyles.fontFamilyRegular,
  },
  info: {
    fontSize: 16,
    fontFamily: AppStyles.fontFamilyRegular,
  },
  companyName: {
    fontSize: 16,
    fontFamily: AppStyles.fontFamilyRegular,
    maxWidth: wp(24),
    marginBottom: Platform.OS === 'ios' ? 10 : 0,
  },

  featureInfo: {
    fontSize: 16,
    flex: 1,
    textAlign: 'left',
    fontFamily: AppStyles.fontFamilyRegular,
    fontWeight: Platform.OS ==='ios' ?'500' : '700'
  },
  subFeatureInfo: {
    fontSize: 14,
    flex: 1,
    textAlign: 'left',
    fontFamily: AppStyles.fontFamilyRegular,
  },
  attemptsInfo: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    fontFamily: AppStyles.fontFamilyRegular,
  },
  dividerVital: {
    height: hp(0.1),
    marginBottom: 10,
    flexDirection: 'row',
    marginHorizontal: 5,
    backgroundColor: AppColors.grey,
  },
  btnStyle: {
    backgroundColor: AppColors.primaryColor,
    borderRadius: 15,
    marginBottom: 20,
    height: hp(5),
    width: wp(50),
    borderColor: AppColors.whiteColor,
    padding: 8,
  },
});

export default CorporatePlan;
