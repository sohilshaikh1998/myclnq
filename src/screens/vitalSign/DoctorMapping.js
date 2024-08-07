import React, { Component } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  BackHandler,
  Platform,
  PermissionsAndroid,
  TouchableHighlight,
  I18nManager,
} from "react-native";
import { AppColors } from "../../shared/AppColors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AppStyles } from "../../shared/AppStyles";
import { AppStrings } from "../../shared/AppStrings";
import ProgressLoader from "rn-progress-loader";

import { AppUtils } from "../../utils/AppUtils";
import images from "../../utils/images";
import { SHApiConnector } from "../../network/SHApiConnector";
import { Actions } from "react-native-router-flux";
import DoctorMappingScreenStyle from "./DoctorMappingScreenStyle";
import { moderateScale } from "../../utils/Scaling";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FamilyProfile from "../commonFiles/FamilyProfile";
import { CachedImage, ImageCacheProvider } from "../../cachedImage";
import CheckBox from "react-native-check-box";
import CommonHeaderVital from "../../navigationHeader/CommonHeaderVital";
import { strings } from "../../locales/i18n";
const isRTL = I18nManager.isRTL;
class DoctorMapping extends Component {
  constructor(props) {
    super(props);
    AppUtils.console("appointmentDetails", props);
    this.state = {
      selectedDoctor: [],
      selectedRelative: !props.relativeProfile ? [] : props.relativeProfile,
      relativeProfile: [],
      doctorList: [],
      latitude: 0,
      longitude: 0,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", () => {
      this.onBackPress();
      return true;
    });
  }
  onBackPress() {
    Actions.pop();
    setTimeout(() => {
      AppUtils.console("timeout", "----->");
      Actions.refresh({ update: true });
    }, 500);
  }
  componentWillReceiveProps(props) {
    AppUtils.console("MyAppProps", props);
    if (props.update) {
    }
  }

  doctorListView(item) {
    return (
      <View
        style={{
          height: hp(6),
          backgroundColor: AppColors.whiteColor,
          borderRadius: moderateScale(15),
          marginLeft: moderateScale(3),
          marginTop: moderateScale(10),
          marginBottom: moderateScale(5),
          marginRight: moderateScale(10),
          alignItems: "flex-start",
          flexDirection: "row",
        }}
      >
        <TouchableHighlight
          onPress={() => {
            this.selectDoctor(item.item);
          }}
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            alignSelf: "center",
          }}
          underlayColor="transparent"
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              alignSelf: "center",
            }}
          >
            <CachedImage
              style={{
                width: wp(3),
                height: wp(3),
                marginLeft: wp(2),
                alignSelf: "center",
              }}
              source={
                item.item.isMappedDoctor ? images.selected : images.unselected
              }
            />

            <CachedImage
              style={{
                width: wp(12),
                height: wp(12),
                marginLeft: wp(2),
                borderRadius: hp(50),
                alignSelf: "center",
              }}
              source={{
                uri: AppUtils.handleNullImg(item.item.doctorId.profilePic),
              }}
            />
            <View style={{ alignSelf: "center", marginLeft: wp(5) }}>
              <Text
                style={{
                  fontFamily: AppStyles.fontFamilyRegular,
                  fontSize: moderateScale(12),
                  color: AppColors.blackColor,
                  width: wp(56),
                  textAlign: isRTL ? 'left' : 'auto',
                }}
                numberOfLines={1}
              >
                {item.item.doctorId.doctorName}{" "}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  width: wp(65),
                  fontSize: wp(2.8),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.textGray,
                  textAlign: isRTL ? 'left' : 'auto',
                }}
              >
                {item.item.clinicName}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  width: wp(65),
                  fontSize: wp(2.8),
                  fontFamily: AppStyles.fontFamilyRegular,
                  color: AppColors.textGray,
                  textAlign: isRTL ? 'left' : 'auto',
                }}
              >
                {AppUtils.getAllDepartmentListInString(
                  item.item.doctorId.departmentList
                )}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      </View>
    );
  }
  selectDoctor(item) {
    let updatedList = [];
    let self = this;
    AppUtils.console("ListVital", item.doctorId._id);
    self.state.doctorList.map((list) => {
      let id = list.doctorId._id;
      if (id === item.doctorId._id) {
        list.isMappedDoctor = true;
      } else {
        list.isMappedDoctor = false;
      }
    });
    updatedList = self.state.doctorList;
    AppUtils.console("ListVitalUpdate", updatedList);
    self.setState({ doctorList: updatedList });
  }

  selectedProfile(profile) {
    AppUtils.console("ProfileData", profile);
    this.setState({ relativeProfile: profile });
    this.getRelativeDoctorList(profile._id);
  }

  async getRelativeDoctorList(id) {
    try {
      const location = await AppUtils.getCurrentLocation();
      AppUtils.console("location", location);
      const { latitude, longitude } = location.coords;
      AppUtils.console("vitalProfileData", latitude, " ", longitude);

      let data = {
        relativeId: id,
        latitude: latitude,
        longitude: longitude,
        search: this.state.search,
      };
      AppUtils.console("vitalProfileData", data);

      let response = await SHApiConnector.getRelativeDoctorList(data);

      if (response.data.status) {
        let list = response.data.response;
        AppUtils.console("vitalResponse", list);
        this.setState({
          isLoading: false,
          doctorList: list,
        });

        list.map((item) => {
          if (item.isMappedDoctor) {
            this.setState({ selectedDoctor: item });
          }
        });
      } else {
        AppUtils.console("VitalError", response);
      }
    } catch (e) {
      Alert.alert("", strings("vital.vital.checkLocation"));
      AppUtils.console("VitalError", e);
    }
  }

  rSearch(input) {
    this.setState({ search: input });
    this.getRelativeDoctorList(this.state.relativeProfile._id);
  }
  confirm() {
    AppUtils.console("Data", this.state.doctorList);
    let status = false;
    let selectDoctorId;
    this.state.doctorList.map((list) => {
      AppUtils.console("listdata", list);
      if (!list.isMappedDoctor) {
      } else {
        status = true;
        selectDoctorId = list._id;
      }
    });
    if (!status) {
      Alert.alert("", strings("vital.vital.selectDoctor"));
    } else {
      if (selectDoctorId == this.state.selectedDoctor._id) {
        Alert.alert(
          "",
          strings("vital.vital.alreadyMapped", {
            docName: this.state.selectedDoctor.doctorId.doctorName,
            patientName:
              this.state.relativeProfile.firstName +
              " " +
              this.state.relativeProfile.lastName,
          })
        );
      } else {
        this.mapDoctor();
      }
    }
  }

  async mapDoctor() {
    this.setState({
      isLoading: true,
    });
    let doctorId;
    this.state.doctorList.map((list) => {
      AppUtils.console("listdataDoctor", list);
      if (!list.isMappedDoctor) {
      } else {
        doctorId = list.doctorId._id;
      }
    });
    let body = {
      relativeId: this.state.relativeProfile._id,
      doctorId: doctorId,
      // relativeName:this.state.relativeProfile.firstName +" "+this.state.relativeProfile.lastName
    };

    try {
      let response = await SHApiConnector.mapDoctor(body);
      AppUtils.console("vitalResponse", response);
      if (response.data.status) {
        // Alert.alert("", response.data.response);
        setTimeout(() => {
          Alert.alert("", strings("vital.vital.docMapSuccess"), [
            { cancelable: false },
            {
              text: strings("doctor.button.ok"),
              onPress: () =>
                this.getRelativeDoctorList(this.state.relativeProfile._id),
            },
          ]);
        }, 300);
      } else {
        this.setState({
          isLoading: false,
        });
      }
    } catch (e) {
      this.setState({
        isLoading: false,
      });

      AppUtils.console("Vital", e);
    }
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: AppColors.whiteColor }}>
        <CommonHeaderVital title={strings("vital.vital.docMap")} />
        <KeyboardAwareScrollView style={{ flex: 1 }}>
          <View style={styles.searchViewMain}>
            <TextInput
              allowFontScaling={false}
              placeholder={strings("vital.vital.searchDoc")}
              style={DoctorMappingScreenStyle.searchInputStyle}
              value={this.state.searchText}
              onChangeText={(val) => this.rSearch(val)}
            />
            <Image
              style={DoctorMappingScreenStyle.searchIcon}
              source={images.searchIcon}
            />
          </View>
          <FamilyProfile
            selectedProfile={(profile) => this.selectedProfile(profile)}
            selectedRelative={this.state.selectedRelative}
          />
          <View
            style={{
              justifyContent: "center",
              marginLeft: wp(2.5),
              marginTop: hp(1.5),
            }}
          >
            <TouchableOpacity underlayColor="transparent">
              <Text style={[DoctorMappingScreenStyle.addRecordsTitle, {textAlign: isRTL ? "left" : "auto"}]}>
                {strings("vital.vital.docList")}
              </Text>
            </TouchableOpacity>

            <FlatList
              data={this.state.doctorList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={(item, index) => this.doctorListView(item, index)}
              extraData={this.state}
            />
          </View>
        </KeyboardAwareScrollView>

        <ProgressLoader
          visible={this.state.isLoading}
          isModal={true}
          isHUD={true}
          hudColor={"#FFFFFF"}
          color={AppColors.primaryColor}
        />
        {this.footer()}
      </View>
    );
  }
  footer() {
    return (
      <View
        style={{
          width: wp(100),
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.2,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000000",
          backgroundColor: AppColors.whiteColor,
          paddingBottom: AppUtils.isX ? hp(2) : 0,
          elevation: 2,
          height: AppUtils.isX ? hp(12) : hp(10),
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            this.confirm();
          }}
        >
          <Text style={[DoctorMappingScreenStyle.btnSubmit]}>
            {strings("doctor.button.submit")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textViewStyle: {
    alignSelf: "center",
    height: hp(6),
    flexDirection: "row",
    width: wp(90),
    borderColor: AppColors.backgroundGray,
  },

  textTitleStyle: {
    flex: 1,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 14,
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    alignSelf: "center",
    paddingLeft: wp(5),
  },

  textDataStyle: {
    flex: 1,
    fontSize: 14,
    marginTop: AppUtils.isIphone ? hp(0.5) : 0,
    marginLeft: wp(25),
    alignSelf: "center",
    fontFamily: AppStyles.fontFamilyRegular,
  },
  headerStyle: {
    height: AppUtils.headerHeight,
    width: AppUtils.screenWidth,
    backgroundColor: AppColors.whiteColor,
    alignItems: "center",
    justifyContent: "flex-start",
    alignSelf: "center",
    flexDirection: "row",
  },
  headerTextIOS: {
    color: AppColors.blackColor,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: AppUtils.isX ? 16 + 18 : Platform.OS === "ios" ? 16 : hp(2),
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(15),
  },
});

export default DoctorMapping;
