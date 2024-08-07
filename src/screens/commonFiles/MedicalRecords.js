import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from "react-native";
import ElevatedView from "react-native-elevated-view";
import { CachedImage } from "../../cachedImage";
import { SHApiConnector } from "../../network/SHApiConnector";
import { AppUtils } from "../../utils/AppUtils";
import { AppColors } from "../../shared/AppColors";
import Pdf from "react-native-pdf";
import { Dropdown } from "react-native-material-dropdown";
import SHButtonDefault from "../../shared/SHButtonDefault";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { AppStyles } from "../../shared/AppStyles";
import DocumentPicker from "react-native-document-picker";
import ReactNativeBlobUtil from "react-native-blob-util";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { moderateScale, verticalScale, scale } from "../../utils/Scaling";
import ImagePicker from "react-native-image-crop-picker";
import Toast from "react-native-simple-toast";
import ProgressLoader from "rn-progress-loader";
import mime from "mime";
import _ from "lodash";
import moment from "moment";
import Share from "react-native-share";
import { strings } from "../../locales/i18n";
import ImageZoom from "react-native-image-pan-zoom";
const { width, height } = Dimensions.get("window");
var RNFS = require("react-native-fs");

class MedicalRecords extends React.Component {
  constructor(props) {
    super();
    AppUtils.analyticsTracker("Medical Records");
    AppUtils.console("sdzdasrd_33", props);
    this.state = {
      categoryList: [],
      modalCategoryList: [],
      medicalRecordList: [],
      relativeId: props.relativeId,
      appointmentId: props.appointmentId ? props.appointmentId : null,
      appointmentStartTime: props.startTime ? props.startTime : null,
      selectedCategory: null,
      selectedCategoryId: null,
      categoryIndex: 0,
      modalSelectedCategory: null,
      modalSelectedCategoryId: null,
      modalCategoryIndex: 0,
      isLoading: false,
      uploadFileModal: false,
      localFileList: [],
      totalUploadedSize: 0,
      fullFileViewModal: false,
      selectedFileURL: null,
      isUploaded: false,
      selecteFileType: null,
      totalLocalFileSize: 0,
      totalFile: 0,
      showPdf: false,
      callShare: false,
      pdfUrl: "",
    };
  }

  async componentDidMount() {
    this.fetchMedicalRecords();
    const userResponse = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);
    AppUtils.console("sfdwr4esfssdf", userResponse);
  }

  async fetchMedicalRecords() {
    try {
      let data = {
        relativeId: this.state.relativeId,
        categoryId: this.state.selectedCategoryId,
        appointmentId: this.state.appointmentId,
      };
      this.setState({ isLoading: true });
      let response = await SHApiConnector.fetchMedicalRecords(data);
      if (response.data.status) {
        this.setState(
          {
            isLoading: false,
          },
          () => {
            this.setCategoryInArray(response.data.response);
          }
        );
      } else {
        this.setState({ isLoading: false });
      }
    } catch (e) {
      this.setState({ isLoading: false });
    }
  }

  async setCategoryInArray(categoryData) {
    let categoryList = [{ categoryId: null, value: "All" }];
    let modalCategoryList = [];
    let categories = categoryData.medicalRecords;
    let medicalRecords = [];
    categories.map((category) => {
      categoryList.push({ categoryId: category._id, value: category.category });
      modalCategoryList.push({
        categoryId: category._id,
        value: category.category,
      });
      medicalRecords = medicalRecords.concat(category.medicalRecords);
    });
    this.setState({
      categoryList: categoryList,
      modalCategoryList: modalCategoryList,
      totalUploadedSize: categoryData.totalFileSize,
      totalFile: categoryData.totalFile,
      selectedCategory: categoryList[this.state.categoryIndex].value,
      selectedCategoryId: categoryList[this.state.categoryIndex].categoryId,
      medicalRecordList: medicalRecords,
      modalSelectedCategory:
        modalCategoryList[this.state.modalCategoryIndex].value,
      modalSelectedCategoryId:
        modalCategoryList[this.state.modalCategoryIndex].categoryId,
    });
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.renderHeader()}
        <FlatList
          showsVerticalScrollIndicator={false}
          renderItem={(item) => this.renderItem(item)}
          numColumns={2}
          ListEmptyComponent={this.renderEmpty()}
          data={this.state.medicalRecordList}
          keyExtractor={(item, index) => index.toString()}
        />
        {this.state.appointmentId &&
        moment(this.state.appointmentStartTime).add("30", "hours") < moment()
          ? null
          : this.renderFooter()}
        {this.renderUploadFiles()}
        {this.renderFullFileView()}
        <ProgressLoader
          visible={this.state.isLoading}
          isModal={true}
          isHUD={true}
          hudColor={"#FFFFFF"}
          color={AppColors.primaryColor}
        />
      </View>
    );
  }

  renderEmpty() {
    return (
      <View
        style={{
          height: hp(60),
          width: wp(100),
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={styles.emptyText}>
          {this.state.isLoading ? "" : strings("common.mr.mrNotAvail")}
        </Text>
      </View>
    );
  }

  renderFooter() {
    return (
      <View style={styles.footer}>
        {this.props.relative == "new" ? null : (
          <SHButtonDefault
            btnText={strings("common.mr.deleteAll")}
            btnType={"border-only"}
            style={{
              borderRadius: wp(2),
              marginRight: wp(10),
              width: wp(40),
              borderColor: AppColors.primaryColor,
            }}
            btnTextColor={AppColors.primaryColor}
            btnPressBackground={"transparent"}
            onBtnClick={() => this.checkForDelete(this.state.medicalRecordList)}
          />
        )}

        <SHButtonDefault
          btnText={strings("common.mr.uploadRecords")}
          btnType={"normal"}
          style={{ width: wp(40), borderRadius: wp(2) }}
          btnTextColor={AppColors.whiteColor}
          btnPressBackground={AppColors.primaryColor}
          onBtnClick={() => {
            this.state.appointmentId && this.state.totalFile >= 5
              ? Alert.alert("", strings("common.mr.cannotUploadMoreThenFive"))
              : this.setState({
                  uploadFileModal: true,
                  localFileList: [],
                  totalLocalFileSize: 0,
                });
          }}
        />
      </View>
    );
  }

  async selectPDF() {
    try {
      const docs = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.pdf],
      });
      // RNFS.readFile(docs.uri)
      // .then(result => {
      //     AppUtils.console('fsr4r4sdfsdf',result);
      // }).catch(e => {
      //     AppUtils.console('fsr4r4sdfsdf_error',e);
      // });
      //RNFetchBlob.fs.readFile(docs[0].uri).then(info => AppUtils.console('fsr4r4sdfsdf', info));
      // RNFetchBlob.fs.stat(docs[0].uri)
      // .then((stats) => {AppUtils.console('sdzfw43ersdrfwser3454', stats)})
      // .catch((err) => {AppUtils.console('sdzfw43ersdrfwser3454_error', err)});

      docs.forEach(async (doc) => {
        if (Platform.OS === 'android') {
          // Created a new file path in the app's cache directory
          let newFilePath = `${RNFS.CachesDirectoryPath}/${doc.name}`;
          // Read the file from the content URI
          let fileContent = await RNFS.readFile(doc.uri, 'base64');
          // Written the file content to the new file path
          await RNFS.writeFile(newFilePath, fileContent, 'base64');
          // Updated the file's URI to the new file path
          doc.uri = newFilePath;
        } else {
          // For iOS
          let newFilePath = `${RNFS.TemporaryDirectoryPath}/${doc.name}`;
          // Copied the file from the content URI to the new file path
          await RNFS.copyFile(doc.uri, newFilePath);
          // Updated the file's URI to the new file path
          doc.uri = newFilePath;
        }
      });

      this.mergeDocsForUploading(docs);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        AppUtils.console("error -----", err);
      } else {
        throw err;
      }
    }
  }

  selectImageGalary() {
    ImagePicker.openPicker({ multiple: true, mediaType: "photo" }).then(
      (response) => {
        this.mergeDocsForUploading(response);
      }
    );
  }

  selectImageCamera() {
    ImagePicker.openCamera({ width: 300, height: 400, cropping: true }).then(
      (response) => {
        this.mergeDocsForUploading([response]);
      }
    );
  }

  async mergeDocsForUploading(medicalRecords) {
    let arrayOfFiles = [];
    let currentDataTime = new Date().getTime();

    let arrayLength = this.state.localFileList.length;
    let appointmentFileLength = this.state.appointmentId
      ? parseInt(arrayLength) + parseFloat(this.state.totalFile)
      : 0;
    let remainLength = this.state.appointmentId
      ? 5 - parseInt(appointmentFileLength)
      : 10 - parseInt(arrayLength);

    AppUtils.console(
      "sedf3r2edssdfs",
      this.state.localFileList,
      this.state.totalFile,
      medicalRecords,
      remainLength,
      arrayLength
    );

    if (remainLength >= medicalRecords.length) {
      let totalLocalFileSize = this.state.totalLocalFileSize;
      medicalRecords.forEach(async (file) => {
        if (file.size <= 5242880) {
          let imageName = file.name ? file.name : file.filename;
          let filePath = file.sourceURL
            ? file.sourceURL
            : file.uri
            ? file.uri
            : file.path;
          totalLocalFileSize = totalLocalFileSize + file.size;
          if (!imageName) {
            let extension = filePath.split(".");
            extension = extension[extension.length - 1];
            imageName = currentDataTime.toString() + "." + extension.toString();
          }

          arrayOfFiles.push({
            path: filePath,
            uri: filePath,
            name: imageName,
            size: file.size,
            type: mime.getType(filePath) ? mime.getType(filePath) : file.type,
          });
        }
        else {
          Alert.alert("", "File size is greater than 5 MB");
        }
      });
      let files = _.unionBy(arrayOfFiles, this.state.localFileList, "path");
      this.setState({
        localFileList: files,
        totalLocalFileSize: totalLocalFileSize,
      });
    } else {
      let msg = this.state.appointmentId
        ? strings("common.mr.cannotUploadMoreThenFive")
        : strings("common.mr.cannotSelectMoreThenTen");
      Alert.alert("", msg);
    }
  }

  localFileLimitAlert(type) {
    if (this.state.appointmentId && this.state.totalFile >= 5) {
      Alert.alert("", strings("common.mr.cannotUploadMoreThenFive"));
    } else if (
      this.state.appointmentId &&
      this.state.localFileList.length >= 5
    ) {
      Alert.alert("", strings("common.mr.cannotUploadMoreThenFive"));
    } else if (this.state.localFileList.length >= 10) {
      Alert.alert("", strings("common.mr.cannotUploadMoreThenTen"));
    } else {
      type == "camera"
        ? this.selectImageCamera()
        : type == "galary"
        ? this.selectImageGalary()
        : this.selectPDF();
    }
  }

  renderUploadFiles() {
    return (
      <Modal
        visible={this.state.uploadFileModal}
        transparent={true}
        animationType={"fade"}
        onRequestClose={() => AppUtils.console("Close")}
      >
        <View style={styles.modalView}>
          <View style={styles.innerContainer}>
            <View style={styles.textView}>
              <Text style={styles.uploadText}>
                {strings("common.mr.uploadMR")}
              </Text>
              <Text style={styles.supportedUpload}>
                {strings("common.mr.acceptedForm")}
              </Text>
            </View>
            {this.renderModalHeader()}
            <View style={styles.maxView}>
              <Image
                resizeMode="contain"
                style={styles.alertIconstyle}
                source={require("../../../assets/images/alert.png")}
              />
              <Text style={styles.maxAlert}>
                {strings("common.mr.maxAllotedSize", {
                  size: AppUtils.niceBytes(
                    this.state.totalUploadedSize + this.state.totalLocalFileSize
                  ),
                })}
              </Text>
            </View>
            <View style={styles.selectOption}>
              <TouchableOpacity
                onPress={() => this.localFileLimitAlert("camera")}
                style={styles.addIcon}
              >
                <MaterialCommunityIcons
                  name="camera"
                  size={30}
                  color="#FF4848"
                />
                <Text style={styles.uploadPrescription}>
                  {strings("common.mr.openCam")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.localFileLimitAlert("galary")}
                style={styles.addIcon}
              >
                <MaterialCommunityIcons
                  name="folder-multiple-image"
                  size={30}
                  color="#FF4848"
                />
                <Text style={styles.uploadPrescription}>
                  {strings("common.mr.openGallary")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.localFileLimitAlert("pdf")}
                style={styles.addIcon}
              >
                <MaterialIcons
                  name="picture-as-pdf"
                  size={30}
                  color="#FF4848"
                />
                <Text style={styles.uploadPrescription}>
                  {strings("common.mr.attachPDF")}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.prescriptionList}>
              <FlatList
                data={this.state.localFileList}
                keyExtractor={(item, index) => index.toString()}
                renderItem={(item) => this.renderLocalFile(item)}
                extraData={this.state}
              />
            </View>
            <View style={styles.uploadCloseContainer}>
              <TouchableOpacity
                underlayColor="transparent"
                onPress={() =>
                  this.setState({ uploadFileModal: false, localFileList: [] })
                }
              >
                <View style={styles.cancelModalContainer}>
                  <Text style={[styles.buttonText, { color: "black" }]}>
                    {strings("doctor.button.capCancel")}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                underlayColor="transparent"
                onPress={() => this.validataUploadData()}
              >
                <View style={styles.okContainer}>
                  <Text style={styles.buttonText}>
                    {strings("common.mr.capUpload")}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
  renderLocalFile(item) {
    let extension = item.item.name.split(".");
    extension = extension[extension.length - 1];
    return (
      <View style={styles.prescriptionListContainer}>
        <TouchableOpacity
          onPress={() => this.showFullView(item, extension)}
          style={styles.prescptionView}
        >
          {extension == "pdf" ? (
            <Pdf
              source={{ uri: item.item.path }}
              onLoadComplete={(numberOfPages, filePath) => {
                AppUtils.console(`number of pages: ${numberOfPages}`);
              }}
              onPageChanged={(page, numberOfPages) => {
                AppUtils.console(`current page: ${page}`);
              }}
              onError={(error) => {
                AppUtils.console("error", error);
              }}
              style={styles.prescriptionIcon}
            />
          ) : (
            <Image
              source={{ uri: item.item.path }}
              style={styles.prescriptionIcon}
              resizeMode={"cover"}
            />
          )}
        </TouchableOpacity>
        <View style={styles.prescriptionNameView}>
          <View style={styles.prescriptionName}>
            <Text
              allowFontScaling={false}
              style={styles.text}
              numberOfLines={1}
            >
              {item.item.name}
            </Text>
          </View>

          <View />
          <TouchableOpacity
            onPress={() => this.deleteFileFromArray(item.index)}
          >
            <Image
              source={require("../../../assets/images/delete-myclnq.png")}
              style={styles.delete}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  deleteFileFromArray(index) {
    let file = this.state.localFileList;
    let totalLocalFileSize = this.state.totalLocalFileSize - file[index].size;
    file.splice(index, 1);
    AppUtils.console("sdxzc32r4efds", file, index);
    this.setState({
      localFileList: file,
      totalLocalFileSize: totalLocalFileSize,
    });
  }

  async validataUploadData() {
    let totalFileSizes =
      this.state.totalUploadedSize + this.state.totalLocalFileSize;
    if (209715200 - totalFileSizes <= 0) {
      Alert.alert("", strings(common.mr.limitComplete));
    } else if (this.state.localFileList.length > 0) {
      this.setState({ uploadFileModal: false }, () => {
        setTimeout(() => {
          this.uploadPrescription();
        }, 500);
      });
    } else {
      Toast.show(strings(common.mr.selectFile));
    }
  }

  async uploadPrescription() {
    try {
      let form = new FormData();
      let data = {
        relativeId: this.state.relativeId,
        appointmentId: this.state.appointmentId,
        medicalRecordsCategoryId: this.state.modalSelectedCategoryId,
      };
      AppUtils.console("uploadPrescription_405", data);

      this.state.localFileList.map((file) => {
        form.append("file", file);
      });
      form.append("data", JSON.stringify(data));

      AppUtils.console("uploadPrescription_341", form);
      this.setState({ isLoading: true });
      let response = await SHApiConnector.uploadMedicalRecords(form);
      AppUtils.console("uploadPrescription_response", response);
      if (response.data.status) {
        this.setState(
          {
            isLoading: false,
            localFileList: [],
            selectCategory: this.state.modalSelectedCategory,
            selectedCategoryId: this.state.modalSelectedCategoryId,
            categoryIndex: this.state.modalCategoryIndex + 1,
            totalLocalFileSize: 0,
          },
          () => {
            Alert.alert("", strings("common.mr.mrUploaded"));
            this.setCategoryInArray(response.data.response);
          }
        );
      } else {
        this.setState({ isLoading: false });
      }
    } catch (e) {
      this.setState({ isLoading: false });
      AppUtils.console("uploadPrescription", e);
    }
  }

  async downloadRecords(data) {
    this.setState({ callShare: true });
    let dirs = ReactNativeBlobUtil.fs.dirs;
    let PictureDir = Platform.OS === "ios" ? dirs.LibraryDir : dirs.PictureDir;
    let date = new Date();
    let fileType = data.recordType.toLowerCase();
    let path = PictureDir + "/" + data.recordName + "." + fileType;
    if (Platform.OS === "android") {
      const checkWritePermission = PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      if (checkWritePermission !== PermissionsAndroid.RESULTS.GRANTED) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: strings("doctor.alertTitle.galPermission"),
              message: strings("doctor.alertMsg.galPermission", {
                name: "health records",
              }),
            }
          );
        } catch (e) {
          AppUtils.console("Error:", e);
        }
      }
    }
    ReactNativeBlobUtil.config({
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
        notification: false,
        description: strings("common.mr.downloadingMR"),
        mime: fileType == "pdf" ? "pdf" : "image/jpg",
        path: path,
      },
      path: path,
    })
      .fetch("GET", data.recordURL)
      .then((res) => {
        let shareApp = {
          url: AppUtils.isIphone ? res.data : "file:///" + res.data,
        };
        Share.open(shareApp)
          .then((res) => {
            console.log(res);
            this.setState({ callShare: false });
          })
          .catch((err) => {
            console.log(err);
            this.setState({ callShare: false });
          });
      })
      .catch((err) => AppUtils.console("Share Catch", err));
  }

  renderHeader() {
    return (
      <ElevatedView elevation={2} style={styles.header}>
        <View style={{ marginLeft: wp(5.5), marginRight: wp(5.5) }}>
          <TouchableOpacity
            onPress={() => this.refs.departmentDropdown.onPress()}
            style={{
              height: hp(6),
              justifyContent: "center",
              fontFamily: AppStyles.fontFamilyRegular,
              borderWidth: hp(0.2),
              borderColor: AppColors.backgroundGray,
              borderRadius: hp(1),
              width: wp(90),
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Dropdown
              ref={"departmentDropdown"}
              label=""
              textColor={AppColors.blackColor}
              itemColor={AppColors.blackColor}
              fontFamily={AppStyles.fontFamilyRegular}
              dropdownPosition={-5}
              dropdownOffset={{ top: hp(2), left: wp(1.8) }}
              itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
              rippleCentered={false}
              dropdownMargins={{ min: 8, max: 16 }}
              baseColor={"transparent"}
              value={
                this.state.selectedCategory
                  ? this.state.selectedCategory
                  : "Select Category"
              }
              onChangeText={(value, index, data) =>
                this.selectCategory(value, index, data)
              }
              pickerStyle={{
                width: wp(89),
                height: hp(40),
              }}
              containerStyle={{
                width: wp(80),
                marginTop:
                  Platform.OS === "ios" ? (AppUtils.isX ? hp(1) : hp(3)) : 0,
                justifyContent: "center",
              }}
              data={this.state.categoryList}
            />
            <Image
              resizeMode={"contain"}
              style={{ height: hp(2.5), width: hp(2.5) }}
              source={require("../../../assets/images/arrow_down.png")}
            />
          </TouchableOpacity>
        </View>
      </ElevatedView>
    );
  }

  renderModalHeader() {
    return (
      <ElevatedView elevation={0} style={styles.modalHeader}>
        <View
          style={{ marginLeft: wp(3), marginRight: wp(3), marginTop: hp(2) }}
        >
          <TouchableOpacity
            onPress={() => this.refs.departmentDropdownModal.onPress()}
            style={{
              height: AppUtils.isX ? hp(4) : hp(5),
              justifyContent: "center",
              fontFamily: AppStyles.fontFamilyRegular,
              borderWidth: hp(0.2),
              borderColor: AppColors.backgroundGray,
              borderRadius: hp(1),
              width: wp(70),
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Dropdown
              ref={"departmentDropdownModal"}
              label=""
              textColor={AppColors.blackColor}
              itemColor={AppColors.blackColor}
              fontFamily={AppStyles.fontFamilyRegular}
              dropdownPosition={-5}
              dropdownOffset={{ top: hp(2), left: wp(1.8) }}
              itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
              rippleCentered={false}
              dropdownMargins={{ min: 8, max: 16 }}
              baseColor={"transparent"}
              value={
                this.state.modalSelectedCategory
                  ? this.state.modalSelectedCategory
                  : "Select Category"
              }
              onChangeText={(value, index, data) =>
                this.selectModalCategory(value, index, data)
              }
              pickerStyle={{
                width: wp(70),
                height: hp(40),
              }}
              containerStyle={{
                width: wp(60),
                marginTop:
                  Platform.OS === "ios" ? (AppUtils.isX ? hp(3) : hp(3.5)) : 0,
                justifyContent: "center",
              }}
              data={this.state.modalCategoryList}
            />
            <Image
              resizeMode={"contain"}
              style={{ height: hp(2.5), width: hp(2.5) }}
              source={require("../../../assets/images/arrow_down.png")}
            />
          </TouchableOpacity>
        </View>
      </ElevatedView>
    );
  }

  selectCategory(value, index, data) {
    AppUtils.console(
      "sdfcwsedgfbvcx43",
      value,
      index,
      data,
      data[index].categoryId
    );
    this.setState(
      {
        selectedCategory: value,
        categoryIndex: index,
        selectedCategoryId: data[index].categoryId,
      },
      () => {
        this.fetchMedicalRecords();
      }
    );
  }

  selectModalCategory(value, index, data) {
    this.setState({
      modalSelectedCategory: value,
      modalCategoryIndex: index,
      modalSelectedCategoryId: data[index].categoryId,
    });
  }

  async deleteRecords(items) {
    try {
      let data = {
        medicalRecords: items,
        relativeId: this.state.relativeId,
        categoryId: this.state.selectedCategoryId,
        appointmentId: this.state.appointmentId,
      };
      this.setState({ isLoading: true });
      let response = await SHApiConnector.deleteMedicalRecords(data);
      if (response.data.status) {
        this.setState(
          {
            isLoading: false,
            localFileList: [],
          },
          () => {
            Alert.alert(
              "",
              response.data.message,
              [
                {
                  text: strings("doctor.button.ok"),
                  onPress: () =>
                    this.setCategoryInArray(response.data.response),
                },
              ],
              { cancelable: false }
            );
          }
        );
      } else {
        this.setState({ isLoading: false });
      }
    } catch (e) {
      this.setState({ isLoading: false });
    }
  }

  checkForDelete(data) {
    let finalData = [];
    data.map((file) => {
      finalData.push({ _id: file._id, fileUrl: file.recordURL });
    });

    let msg =
      finalData.length == 1
        ? strings("common.mr.sureWanttoDeleteOneMR")
        : strings("common.mr.sureWantToDeleteMultipleMR");
    Alert.alert("", msg, [
      { text: strings("doctor.button.cancel") },
      { text: strings("doctor.button.delete"), onPress: () => this.deleteRecords(finalData) },
    ]);
  }

  showFullView(item, fileType) {
    this.setState({ uploadFileModal: false }, () => {
      setTimeout(() => {
        this.setState({
          fullFileViewModal: true,
          selectedFileURL: item.item.recordURL
            ? item.item.recordURL
            : item.item.uri,
          isUploaded: item.item._id ? true : false,
          selecteFileType: fileType,
          callShare: false,
        });
      }, 500);
    });
  }

  closeFullView() {
    this.setState({ fullFileViewModal: false }, () => {
      setTimeout(() => {
        this.setState({
          uploadFileModal: !this.state.isUploaded,
          callShare: false,
        });
      }, 500);
    });
  }

  renderFullFileView() {
    return (
      <Modal
        visible={this.state.fullFileViewModal}
        transparent={true}
        animationType={"fade"}
        onRequestClose={() => AppUtils.console("Close")}
      >
        <View style={styles.modalView}>
          <View style={styles.fullViewInnerContainer}>
            {this.state.selecteFileType == "PDF" ||
            this.state.selecteFileType == "pdf" ? (
              <Pdf
                source={{ uri: this.state.selectedFileURL }}
                onLoadComplete={(numberOfPages, filePath) => {
                  AppUtils.console(`number of pages: ${numberOfPages}`);
                }}
                onPageChanged={(page, numberOfPages) => {
                  AppUtils.console(`current page: ${page}`);
                }}
                onError={(error) => {
                  AppUtils.console("error", error);
                }}
                style={styles.fullUplodedDocView}
              />
            ) : (
              <ImageZoom
                cropWidth={Dimensions.get("window").width}
                cropHeight={Dimensions.get("window").height}
                imageWidth={Dimensions.get("window").width}
                imageHeight={Dimensions.get("window").height}
                enableSwipeDown={true}
              >
                <CachedImage
                  style={styles.fullUplodedDocView}
                  resizeMode={"contain"}
                  source={{ uri: this.state.selectedFileURL }}
                />
              </ImageZoom>
            )}
            <TouchableOpacity
              onPress={() => this.closeFullView()}
              style={{ position: "absolute", top: hp(5), right: wp(5) }}
            >
              <Image
                source={require("../../../assets/images/cancel.png")}
                style={{
                  height: hp(5),
                  width: hp(5),
                  alignSelf: "flex-end",
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  renderItem(item) {
    return (
      <TouchableOpacity
        onPress={() => {
          if (item.item.recordType.toLowerCase() == "pdf") {
            this.setState({ isLoading: true });
            ReactNativeBlobUtil.config({ fileCache: true })
              .fetch("GET", item.item.recordURL)
              .then((res) => {
                this.setState({
                  showPdf: true,
                  pdfUrl: AppUtils.isIphone ? res.data : "file:///" + res.data,
                  isLoading: false,
                });
              })
              .catch((err) => {
                this.setState({ isLoading: false });
                AppUtils.consoleLog("Blob catch", err);
              });
          } else {
            this.showFullView(item, item.item.recordType.toLowerCase());
          }
        }}
        style={{ width: wp(50), alignItems: "center", marginBottom: hp(3) }}
      >
        <View style={styles.uploadedDocMainView}>
          {item.item.recordType == "PDF" ? (
            // <Pdf
            //   source={{ uri: item.item.recordURL, cache: true }}
            //   onLoadComplete={(numberOfPages, filePath) => {
            //     AppUtils.console(`number of pages: ${numberOfPages}`);
            //   }}
            //   onPageChanged={(page, numberOfPages) => {
            //     AppUtils.console(`current page: ${page}`);
            //   }}
            //   onError={(error) => {
            //     AppUtils.console("error", error);
            //   }}
            //   style={styles.uploadedDocView}
            // />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                height: hp(20),
              }}
            >
              <FontAwesome name="file-pdf-o" size={64} color={"#000"} />
            </View>
          ) : (
            <CachedImage
              style={styles.uploadedDocView}
              resizeMode={"contain"}
              source={{ uri: item.item.recordURL }}
            />
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: wp(2),
            }}
          >
            <View
              style={{
                // marginLeft: wp(4),
                // marginRight: wp(4),
                // marginTop: wp(2),
                // marginBottom: wp(2),
                // justifyContent: "space-between",
                padding: wp(2),
                width: wp(25),
              }}
            >
              <Text
                style={styles.textStyle}
                numberOfLines={1}
                ellipsizeMode={"middle"}
              >
                {item.item.recordName}
              </Text>
              <Text style={styles.textStyle}>
                {AppUtils.niceBytes(item.item.recordSize)}
              </Text>
            </View>
            <View
              style={{
                // marginLeft: wp(4),
                flexDirection: "row",
                // marginRight: wp(4),
                // marginTop: wp(2),
                // marginBottom: wp(2),
                justifyContent: "space-evenly",
                alignItems: "center",
              }}
            >
              {this.state.appointmentId &&
              moment(this.state.appointmentStartTime).add("30", "hours") <
                moment() ? null : (
                <TouchableOpacity
                  onPress={() => this.checkForDelete([item.item])}
                >
                  <Image
                    style={[
                      styles.buttonStyle,
                      { marginRight: wp(3), tintColor: AppColors.primaryColor },
                    ]}
                    source={require("../../../assets/images/delete-myclnq.png")}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  if (!this.state.callShare) {
                    this.downloadRecords(item.item);
                  }
                }}
              >
                <Image
                  style={[styles.buttonStyle, { marginRight: wp(1) }]}
                  source={require("../../../assets/images/share-myclnq.png")}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.showPdf}
        >
          <TouchableOpacity
            onPress={() => this.setState({ showPdf: false })}
            style={{
              position: "absolute",
              top: hp(Platform.OS === "ios" ? 5 : 2),
              right: wp(2),
              zIndex: 1,
            }}
          >
            <Image
              source={require("../../../assets/images/cancel.png")}
              style={{ height: hp(5), width: hp(5), alignSelf: "flex-end" }}
            />
          </TouchableOpacity>
          {this.state.pdfUrl && (
            <Pdf
              source={{
                uri: this.state.pdfUrl,
              }}
              trustAllCerts={false}
              onLoadComplete={(numberOfPages, filePath) => {
                console.log(`Number of pages: ${numberOfPages}`);
              }}
              onPageChanged={(page, numberOfPages) => {
                console.log(`Current page: ${page}`);
              }}
              onError={(error) => {
                console.log(error);
              }}
              onPressLink={(uri) => {
                console.log(`Link pressed: ${uri}`);
              }}
              style={{ flex: 1, position: "relative", backgroundColor: "#FFF" }}
            />
          )}
        </Modal>
      </TouchableOpacity>
    );
  }
}
export default MedicalRecords;

const styles = StyleSheet.create({
  uploadedDocMainView: {
    width: wp(42),
    backgroundColor: AppColors.whiteColor,
    borderColor: AppColors.backgroundGray,
    borderWidth: 0.5,
    paddingTop: wp(4),
    paddingBottom: wp(1),
    borderRadius: wp(2),
  },
  uploadedDocView: {
    width: wp(40),
    height: hp(25),
    backgroundColor: AppColors.whiteColor,
  },
  fullUplodedDocView: {
    width: wp(95),
    height: hp(92),
    backgroundColor: AppColors.whiteColor,
    alignSelf: "center",
    justifyContent: "center",
  },
  textStyle: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: wp(3.5),
  },
  buttonStyle: {
    height: wp(6),
    width: wp(6),
  },

  header: {
    width: wp(100),
    height: hp(7.2),
    alignSelf: "flex-start",
    marginBottom: hp(2),
    backgroundColor: AppColors.whiteColor,
  },

  modalHeader: {
    width: wp(75),
    height: 55,
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: AppColors.whiteColor,
  },
  footer: {
    width: wp(100),
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    backgroundColor: AppColors.whiteColor,
    paddingBottom: AppUtils.isX ? hp(2) : 0,
    elevation: 5,
    height: AppUtils.isX ? hp(12) : hp(10),
    flexDirection: "row",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.cardBgColor,
  },
  listView: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  row: {
    padding: 4,
    paddingLeft: 0,
  },
  content: {
    marginLeft: 40,
  },
  timeline: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: moderateScale(45),
    width: 40,
    justifyContent: "center", // center the dot
    alignItems: "center",
  },
  line: {
    position: "absolute",
    top: 0,
    left: 18,
    width: 4,
    bottom: 0,
  },
  topLine: {
    flex: 1,
    width: moderateScale(1),
    backgroundColor: AppColors.textField,
  },
  bottomLine: {
    flex: 1,
    width: moderateScale(1),
    backgroundColor: AppColors.textField,
  },
  hiddenLine: {
    width: 0,
  },
  mainView: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: moderateScale(15),
    marginRight: moderateScale(15),
    marginTop: moderateScale(15),
  },
  mainText: {
    fontSize: moderateScale(17),
    alignSelf: "center",
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.black,
  },
  errorMsgText: {
    fontSize: moderateScale(15),
    alignSelf: "center",
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.colorHeadings,
    margin: moderateScale(50),
  },
  skipText: {
    fontSize: moderateScale(11),
    alignSelf: "center",
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.black,
  },
  pickerContainer: {
    height: verticalScale(60),
    width: scale(80),
    color: AppColors.black,
    borderBottomWidth: moderateScale(1),
    borderColor: AppColors.colorHeadings,
    marginTop: moderateScale(10),
  },
  date: {
    borderBottomWidth: 0,
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: moderateScale(11),
    marginTop: verticalScale(20),
    textAlign: "left",
  },
  FloatingButtonStyle: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
  },
  TouchableOpacityStyle: {
    position: "absolute",
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: AppColors.whiteColor,
    alignItems: "center",
    justifyContent: "center",
    right: 30,
    bottom: 70,
  },
  startContainer: {
    backgroundColor: AppColors.green,
    flexDirection: "row",
    height: verticalScale(20),
    width: scale(45),
    borderRadius: moderateScale(45 / 2),
    marginRight: moderateScale(5),
    alignItems: "center",
    justifyContent: "center",
    marginTop: moderateScale(5),
  },
  cancelModalContainer: {
    backgroundColor: AppColors.whiteColor,
    flexDirection: "row",
    height: verticalScale(30),
    width: scale(65),
    borderRadius: moderateScale(65 / 2),
    marginRight: moderateScale(15),
    alignItems: "center",
    justifyContent: "center",
    marginTop: moderateScale(5),
    borderColor: AppColors.colorHeadings,
    borderWidth: 1,
  },
  okContainer: {
    backgroundColor: AppColors.colorHeadings,
    flexDirection: "row",
    height: verticalScale(30),
    width: scale(65),
    borderRadius: moderateScale(65 / 2),
    marginRight: moderateScale(5),
    alignItems: "center",
    justifyContent: "center",
    marginTop: moderateScale(5),
  },
  finishContainer: {
    backgroundColor: AppColors.whiteColor,
    flexDirection: "row",
    height: verticalScale(20),
    width: scale(45),
    borderRadius: moderateScale(45 / 2),
    marginRight: moderateScale(5),
    alignItems: "center",
    justifyContent: "center",
    marginTop: moderateScale(5),
  },
  buttonText: {
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.whiteColor,
    alignSelf: "center",
    paddingTop: AppUtils.isIphone ? hp(0.3) : 0,
  },
  finishText: {
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.colorHeadings,
    alignSelf: "center",
  },
  cancelContainer: {
    backgroundColor: AppColors.navyBlue,
    flexDirection: "column",
    height: verticalScale(20),
    width: scale(45),
    borderRadius: moderateScale(45 / 2),
    alignItems: "center",
    justifyContent: "center",
    marginTop: moderateScale(5),
  },
  viewWithoutFB: {
    flex: 1,
    flexDirection: "column",
  },
  viewWithoutList: {
    flexDirection: "column",
    elevation: 5,
    backgroundColor: AppColors.whiteColor,
    width: width,
  },
  calenderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  flatList: {
    flex: 1,
  },
  calendarPicker: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imgStyle: {
    width: 20,
    height: 20,
    marginLeft: moderateScale(10),
  },
  pickerStyle: {
    flexDirection: "row",
    height: verticalScale(60),
    width: scale(70),
  },
  doctorsList: {
    flexDirection: "column",
    marginBottom: moderateScale(100),
  },
  weekDaysMainView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weekDaysSubView: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  weekDaysText: {
    fontSize: moderateScale(13),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.grey,
    textAlign: "center",
    margin: moderateScale(10),
  },
  hiddenView: {
    flexDirection: "row",
    height: moderateScale(30),
    width: moderateScale(30),
    borderRadius: moderateScale(15),
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    fontSize: moderateScale(12),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.black,
    textAlign: "center",
    alignSelf: "center",
  },
  doctorMainView: {
    flex: 1,
    flexDirection: "row",
  },
  timeSlot: {
    flexDirection: "column",
    justifyContent: "center",
    marginLeft: moderateScale(10),
    marginTop: moderateScale(10),
  },
  timeSlotView: {
    fontSize: moderateScale(8),
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.grey,
    textAlign: "left",
    marginBottom: moderateScale(10),
  },
  doctorCardView: {
    height: verticalScale(150),
    width: scale(270),
    borderRadius: moderateScale(10),
    flexDirection: "column",
    justifyContent: "space-between",
    marginLeft: moderateScale(40),
    marginTop: moderateScale(5),
    marginBottom: moderateScale(5),
    elevation: 5,
  },
  innerCardView: {
    flex: 1,
    flexDirection: "row",
    margin: moderateScale(5),
  },
  doctorsImgView: {
    flexDirection: "column",
  },
  doctorProfile: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(20),
    borderColor: AppColors.whiteColor,
    borderWidth: moderateScale(1),
    marginBottom: moderateScale(15),
    borderBottomWidth: moderateScale(0),
    marginLeft: moderateScale(5),
  },
  doctorImg: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(20),
  },
  docDataView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  docMainText: {
    fontSize: moderateScale(13),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.black,
    marginRight: moderateScale(2),
  },
  uploadText: {
    fontSize: moderateScale(13),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.black,
    marginRight: moderateScale(2),
  },
  emptyText: {
    fontSize: moderateScale(20),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.primaryColor,
    padding: wp(3),
    marginRight: moderateScale(2),
    textAlign: "center",
  },
  uploadPrescription: {
    color: AppColors.black,
    marginLeft: moderateScale(5),
    marginTop: moderateScale(5),
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyMedium,
  },
  docMainTextNum: {
    fontSize: moderateScale(9),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.black,
  },
  statusDocText: {
    fontSize: moderateScale(7),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.black,
  },
  docSubText: {
    fontSize: moderateScale(8),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.grey,
  },
  supportedUpload: {
    marginTop: moderateScale(3),
    fontSize: moderateScale(8),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.grey,
  },
  alertStyle: {
    // marginTop: moderateScale(3),
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyMedium,
    color: "red",
  },
  maxAlert: {
    marginTop: moderateScale(2),
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyMedium,
    color: "red",
    paddingRight: wp(10),
  },
  maxView: {
    marginVertical: moderateScale(10),
    flexDirection: "row",
    marginLeft: moderateScale(30),
    marginBottom: moderateScale(5),
  },
  alertView: {
    flexDirection: "row",
    marginLeft: moderateScale(30),
    marginBottom: moderateScale(10),
  },
  alertIconstyle: {
    height: verticalScale(12),
    width: scale(12),
    marginRight: moderateScale(5),
    alignSelf: "center",
    //marginBottom: moderateScale(5)
  },
  innerData: {
    flex: 0.2,
    flexDirection: "column",
  },
  selectOption: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: moderateScale(10),
    marginBottom: moderateScale(5),
  },
  addIcon: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: moderateScale(10),
  },
  uploadView: {
    flex: 0.2,
    flexDirection: "column",
  },
  startSlotView: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "center",
  },
  timeAvailView: {
    flex: 0.5,
    flexDirection: "row",
    marginLeft: moderateScale(50),
    marginRight: moderateScale(50),
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeNameText: {
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.grey,
  },
  timeSlotText: {
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyRegular,
    marginBottom: moderateScale(5),
    marginTop: moderateScale(5),
  },
  iconImg: {
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(14),
  },
  uploadIcon: {
    width: moderateScale(25),
    height: moderateScale(25),
    borderRadius: moderateScale(25),
  },
  statusText: {
    flexDirection: "row",
    marginTop: moderateScale(5),
    //marginBottom:moderateScale(15),
    height: moderateScale(30),
    width: moderateScale(80),
    marginLeft: moderateScale(2),
  },
  smallImg: {
    height: moderateScale(8),
    width: moderateScale(8),
    borderRadius: moderateScale(8),
    marginRight: moderateScale(3),
  },
  dotImg: {
    height: moderateScale(21),
    width: moderateScale(21),
    borderRadius: moderateScale(21),
  },
  dot: {
    width: moderateScale(21),
    height: moderateScale(21),
    borderRadius: moderateScale(21),
    backgroundColor: AppColors.cardBgColor,
    alignItems: "center",
    justifyContent: "center",
  },
  pickersView: {
    flex: 1,
    flexDirection: "row",
    marginLeft: moderateScale(15),
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalContainer: {
    height: verticalScale(150),
    width: scale(250),
    backgroundColor: AppColors.whiteColor,
    margin: moderateScale(50),
    marginTop: moderateScale(100),
    borderRadius: moderateScale(30),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  modalContainerForB: {
    flex: 1,
    flexDirection: "column",
    // height:verticalScale(250),
    width: width,
    backgroundColor: AppColors.whiteColor,
    margin: moderateScale(50),
    marginTop: moderateScale(100),
    borderRadius: moderateScale(30),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    elevation: 5,
    borderColor: AppColors.colorHeadings,
    borderWidth: moderateScale(1),
  },
  buttonContainer: {
    backgroundColor: AppColors.colorHeadings,
    flexDirection: "column",
    height: verticalScale(30),
    width: scale(50),
    borderRadius: moderateScale(15),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  buttonTextBg: {
    fontSize: moderateScale(11),
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.whiteColor,
    margin: moderateScale(15),
    alignSelf: "center",
  },
  buttonWithoutBg: {
    backgroundColor: AppColors.whiteColor,
    flexDirection: "column",
    height: verticalScale(30),
    width: scale(50),
    borderRadius: moderateScale(15),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderWidth: moderateScale(1),
    borderColor: AppColors.colorHeadings,
    marginLeft: moderateScale(10),
  },
  buttonWithoutBgText: {
    fontSize: moderateScale(11),
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.black,
    margin: moderateScale(15),
    alignSelf: "center",
  },
  termsView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: moderateScale(10),
  },

  headingText: {
    color: AppColors.black,
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: moderateScale(13),
    marginBottom: moderateScale(20),
  },
  lastContainer: {
    flexDirection: "row",
    margin: moderateScale(15),
    alignItems: "flex-end",
    marginLeft: moderateScale(70),
  },
  buttonContainerBC: {
    backgroundColor: AppColors.colorHeadings,
    height: verticalScale(30),
    width: scale(70),
    borderRadius: moderateScale(15),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextBgBC: {
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.whiteColor,
    margin: moderateScale(15),
    alignSelf: "center",
  },
  buttonWithoutBgBC: {
    backgroundColor: AppColors.whiteColor,
    height: verticalScale(30),
    width: scale(70),
    borderRadius: moderateScale(15),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppColors.colorHeadings,
    marginLeft: moderateScale(30),
    marginRight: moderateScale(20),
  },
  buttonWithoutBgTextBC: {
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.black,
    margin: moderateScale(15),
    alignSelf: "center",
  },

  lastContainerLM: {
    backgroundColor: AppColors.whiteColor,
    flexDirection: "row",
    margin: moderateScale(15),
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  uploadCloseContainer: {
    backgroundColor: AppColors.whiteColor,
    flexDirection: "row",
    margin: moderateScale(15),
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  buttonContainerLM: {
    backgroundColor: AppColors.colorHeadings,
    height: verticalScale(30),
    width: scale(70),
    borderRadius: moderateScale(15),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonTextBgLM: {
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.colorHeadings,
    margin: moderateScale(15),
    alignSelf: "center",
  },
  buttonWithoutBgLM: {
    backgroundColor: AppColors.whiteColor,
    height: verticalScale(30),
    width: scale(70),
    borderRadius: moderateScale(15),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppColors.colorHeadings,
    marginLeft: moderateScale(30),
    marginRight: moderateScale(20),
  },
  buttonWithoutBgTextLM: {
    fontSize: moderateScale(10),
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.colorHeadings,
    margin: moderateScale(15),
    alignSelf: "center",
  },
  modalView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.transparent,
    height: AppUtils.screenHeight,
    width: AppUtils.screenWidth,
  },
  innerContainer: {
    height: hp(70),
    width: wp(85),
    backgroundColor: AppColors.whiteColor,
    borderRadius: moderateScale(10),
  },
  fullViewInnerContainer: {
    height: hp(100),
    width: wp(100),
    justifyContent: "center",
    backgroundColor: AppColors.whiteColor,
  },
  textView: {
    flexDirection: "column",
    marginLeft: moderateScale(30),
    marginTop: moderateScale(30),
  },
  addIconstyle: {
    height: verticalScale(20),
    width: scale(20),
    marginBottom: moderateScale(5),
  },
  prescriptionList: {
    height: moderateScale(180),
    marginHorizontal: moderateScale(10),
    backgroundColor: AppColors.whiteColor,
    borderRadius: moderateScale(10),
    flex: 1,
    flexDirection: "column",
  },
  prescriptionListContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: moderateScale(15),
    marginRight: moderateScale(15),
    marginTop: moderateScale(5),
    marginBottom: moderateScale(5),
    borderColor: AppColors.lightGrey,
    alignItems: "center",
  },
  prescptionView: {
    height: moderateScale(50),
    width: moderateScale(50),
    //borderRadius: moderateScale(5),
    borderColor: AppColors.whiteColor,
    borderWidth: moderateScale(1),
    marginBottom: moderateScale(15),
    borderBottomWidth: moderateScale(0),
    overflow: "hidden",
  },
  prescriptionIcon: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(2),
  },
  prescriptionName: {
    flex: 1,
    flexDirection: "column",
    marginLeft: moderateScale(5),
  },
  prescriptionNameView: {
    flex: 1,
    flexDirection: "row",
    marginBottom: moderateScale(15),
  },
  text: {
    fontSize: moderateScale(13),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.black,
  },
  delete: {
    width: 20,
    height: 20,
    marginLeft: moderateScale(5),
  },
  toastColor: {
    backgroundColor: AppColors.colorHeadings,
    borderRadius: moderateScale(5),
    padding: moderateScale(10),
  },
  toastText: {
    fontSize: moderateScale(14),
    fontFamily: AppStyles.fontFamilyMedium,
    color: AppColors.whiteColor,
  },
});
