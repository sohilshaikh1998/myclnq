import React from 'react'
import { View ,TouchableHighlight,Text,Image,I18nManager,} from 'react-native'
import ToggleIcon from '../../icons/ToggleIcon'
import { moderateScale } from '../../utils/Scaling';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppColors } from '../../shared/AppColors';
import { AppStyles } from '../../shared/AppStyles';

const isRTL = I18nManager.isRTL;
const VitalDevices = ({item, onPress, fitbitConnected, healkitConnected }) => {
  return (
    <View
        style={{
          height: hp(8),
          backgroundColor: AppColors.whiteColor,
          borderRadius: moderateScale(15),
          marginLeft: moderateScale(3),
          marginRight: moderateScale(10),
          alignItems: 'flex-start',
          flexDirection: 'row',
        }}
      >
        <TouchableHighlight
          onPress={() => onPress(item)}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            alignSelf: 'center',
          }}
          underlayColor="transparent"
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
      
            <Image
              style={{
                width: wp(12),
                height: wp(12),
                marginLeft: wp(2),
                borderRadius: hp(50),
                alignSelf: 'center',
              }}
              resizeMode={'contain'}
              source={item.deviceImage}
            />

            <View style={{ alignSelf: 'center', marginLeft: wp(5), marginTop: wp(5) }}>
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: moderateScale(12),
                  color: AppColors.blackColor,
                  width: wp(56),
                  textAlign: isRTL ? 'left' : 'auto'

                }}
                numberOfLines={1}
              >
                {item.deviceName}{' '}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  width: wp(65),
                  fontSize: wp(2.8),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.textGray,
                  textAlign: isRTL ? 'left' : 'auto'

                }}
              >
                {item.brand}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  width: wp(65),
                  fontSize: wp(2.8),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.textGray,
                }}
              >
                {item.description}
              </Text>
            </View>
            {item._id === 1 && <ToggleIcon onPress={() => onPress(item)} isDeviceConnected={fitbitConnected} />}
            {item._id === 2 && <ToggleIcon onPress={() => onPress(item)} isDeviceConnected={healkitConnected} />}
          </View>
        </TouchableHighlight>
      </View>
  )
}

export default VitalDevices
