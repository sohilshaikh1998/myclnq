import { StyleSheet} from 'react-native'
import {AppStyles} from '../shared/AppStyles';
import {moderateScale} from "../utils/Scaling";
import {AppColors} from "../shared/AppColors";


const otpStyles = StyleSheet.create({
    container: {
      marginTop: 30,
      marginHorizontal: 20
    },
    underlineStyleBase: {
        width: 50,
        height: 50,
        borderRadius: 50,
        borderWidth: 2,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15),
        color: AppColors.blackColor,
        backgroundColor: AppColors.backgroundGray
      },
    
      underlineStyleHighLighted: {
        borderColor: AppColors.primaryColor,
        backgroundColor: AppColors.whiteColor
      },
})

export default otpStyles;