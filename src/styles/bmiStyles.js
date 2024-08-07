import { StyleSheet} from 'react-native'
import {AppStyles} from '../shared/AppStyles';
import {moderateScale, verticalScale} from "../utils/Scaling";
import {AppColors} from "../shared/AppColors";


const bmiStyles = StyleSheet.create({
    weightOption: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15),
        color: '#000',
        width: 40,
        textAlign: 'right'
      },
      selected: {
        color: AppColors.primaryColor
      },
      bmiRow: {
        flexDirection: "row",
        height: verticalScale(70),
        borderBottomWidth: 1,
        borderBottomColor: AppColors.backgroundGray,
        alignItems: "center", justifyContent: 'space-between'
      },
      bmiHeader: {
        color: AppColors.blackColor,
        fontSize: moderateScale(15),
        marginTop: verticalScale(20),
        fontFamily: AppStyles.fontFamilyMedium
      },
      bmiInput: {
        width: 80,
        fontSize: 16,
        paddingHorizontal: 10,
        marginTop: verticalScale(20),
        textAlign: 'right'
      },
      bmiOptionHolder: {
        width: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginTop: verticalScale(20),
      }
})

export default bmiStyles;