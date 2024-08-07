import React from "react";
import { Platform, StyleSheet, Text } from "react-native";
import { moderateScale, verticalScale } from "../utils/Scaling";
import { AppUtils } from "../utils/AppUtils";
import { AppStyles } from "../shared/AppStyles";
import { AppColors } from "../shared/AppColors";
import ElevatedView from "react-native-elevated-view";

class CommonHeader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ElevatedView style={styles.headerStyle} elevation={5}>
        <Text allowFontScaling={false} style={styles.headerText}>
          {this.props.title}
        </Text>
      </ElevatedView>
    );
  }
}

const styles = StyleSheet.create({
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    elevation: 5,
  },
  headerText: {
    color: AppColors.blackColor,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: AppUtils.isX
      ? 40
      : Platform.OS === "ios"
      ? 16
      : verticalScale(15),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
});

export default CommonHeader;
