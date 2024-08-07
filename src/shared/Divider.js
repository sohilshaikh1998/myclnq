import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppColors } from './AppColors';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';


const Divider = () => {
  return (
    <View style={styles.dividerView}>
      <View style={styles.dividerLines} />
      <Text>OR</Text>
      <View style={styles.dividerLines} />
    </View>
  );
};

const styles = StyleSheet.create({
  dividerView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  dividerLines: {
    height: hp(0.1),
    width: wp(40),
    flexDirection: 'row',
    backgroundColor: AppColors.greyBorder,
  },
});

export default Divider;
