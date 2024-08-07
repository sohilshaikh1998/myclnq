import React, { Component } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  TextInput,
  StyleSheet,
  View,
  Text,
  Linking,
  TouchableOpacity,
  TouchableHighlight,
  BackHandler,
  Alert
} from "react-native";
import { AppColors } from "../../shared/AppColors";
import CardView from "react-native-cardview";
import AsyncStorage from '@react-native-community/async-storage';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AppStyles } from "../../shared/AppStyles";
import { AppUtils } from "../../utils/AppUtils";
import { scale, verticalScale, moderateScale } from "../../utils/Scaling";
import ProgressLoader from "rn-progress-loader";

import { SHApiConnector } from "../../network/SHApiConnector";
import { Actions } from "react-native-router-flux";
import { strings } from "../../locales/i18n";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import ElevatedView from "react-native-elevated-view";
import images from "./../../utils/images";

import { CachedImage, ImageCacheProvider } from "./../../cachedImage";
import styles from "./ArticleStyle";
import { AppStrings } from "../../shared/AppStrings";

class ArticleHome extends Component {
  constructor(props) {
    super(props);
    AppUtils.analyticsTracker("Medical Equipment User Order Summery");
    this.state = {
      articleList: [],
      searchText: "",
      suggestionList: [],
      showSuggestion: true,
      topArticle: [],
      page: 1,
      count: 10,
      searchView: false,
    };
    this.goBack = this.goBack.bind(this);
  }

  componentDidMount() {
    AppUtils.console("ComponentMountSummary", this.props);

    try {
      this.getArticle();
      this.getSuggestionList();

      BackHandler.addEventListener("hardwareBackPress", () => {
        this.goBack();
        return true;
      });
    } catch (e) {
      AppUtils.console("Error", e);
    }
  }

  componentWillReceiveProps(props) {
    AppUtils.console("MyAppProps", props);
    if (props.update) {
      this.setState({ page: 1 }, () => this.getArticle());
    }
  }

  async getSuggestionList() {
    try {
      let data = { search: this.state.searchText };

      let response = await SHApiConnector.getArticleSuggestion(data);

      AppUtils.console("articleSuggestionResponse", response);
      if (response.data.status) {
        this.setState({
          suggestionList: response.data.response,
          isLoading: false,
        });
      } else {
        this.setState({
          isLoading: false,
        });
      }
    } catch (e) {
      this.setState({
        isLoading: false,
      });

      AppUtils.console("Article", e);
    }
  }

  async getArticle() {
    this.setState({
      isLoading: this.state.page <= 1 && !this.state.searchView,
    });
    try {
      let data = { search: this.state.searchText };

      let response = await SHApiConnector.getArticle(
        this.state.page,
        this.state.count,
        data
      );

 
      if (response?.data?.status) {
        if (this.state.page == 1) {
          let tempArticleList = response?.data?.response?.articleList;
          let tempTopArticles = response?.data?.response?.topArticle
          const uniqueIdsSet = new Set();
          const uniqueTopIdsSet = new Set()

          // Filter the array to get unique objects based on _id
          const uniqueArticles = tempArticleList.filter(obj => {
            if (!uniqueIdsSet.has(obj._id)) {
              uniqueIdsSet.add(obj._id);
              return true;
            }
            return false;
          });

          const uniqueTopArticles = tempTopArticles.filter(obj => {
            if (!uniqueTopIdsSet.has(obj._id)) {
              uniqueTopIdsSet.add(obj._id);
              return true;
            }
            return false;
          });
          
          this.setState({
            articleList: uniqueArticles,
            topArticle: uniqueTopArticles,
            isLoading: false,
            page: this.state.page + 1,
          });
        } else {
          this.setState({
            articleList: [
              ...this.state.articleList,
              ...response.data.response.articleList,
            ],
            topArticle: response.data.response.topArticle,
            isLoading: false,
            page: this.state.page + 1,
          });
        }

        AppUtils.console(
          ">>>>> RES Article ",
          response,
          "currentList",
          this.state.articleList.length
        );
      } else {
        this.setState({
          isLoading: false,
        });
      }
    } catch (e) {
      this.setState({
        isLoading: false,
      });

      AppUtils.console("Article", e);
    }
  }

  renderTopArticle(item) {
    let isBookMark = ''



    if (item.item?.userArticle?.isBookedMark) {
      isBookMark = true
    }
    else{
      isBookMark = false
    }
    return (
      <TouchableOpacity
        onPress={() => Actions.ArticleWebView({ data: item.item })}
        underlayColor="transparent"
        style={[styles.topArticleHeader]}
      >
        <View style={{ flexDirection: "column", margin: hp(1) }}>
          <View style={styles.topSubView}>
            <CachedImage
              style={styles.topImage}
              source={{
                uri: item.item.image
                  ? item.item.image
                  : "https://myclnq.co/wp-content/uploads/2020/06/singapore-consult-doctor-online.png",
              }}
            />
          </View>

          <Text
            allowFontScaling={false}
            numberOfLines={3}
            style={styles.topTitle}
          >
            {item.item.title}
          </Text>
        </View>
        <View style={styles.topBookMarkView}>
          <Image
            resizeMode={"contain"}
            style={styles.topBookMarkImage}
            source={
              isBookMark
                ? require("../../../assets/images/bookmark.png")
                : require("../../../assets/images/addBookMark.png")
            }
          />
        </View>

        <View style={styles.topTopic}>
          <Text
            allowFontScaling={false}
            // numberOfLines={1}
            style={[
              styles.topicText,
              { color: AppColors.primaryColor, fontSize: wp(2) },
            ]}
          >
            {item.item.topic.toUpperCase()}
          </Text>
        </View>

        {/* <View style={styles.topVisibilityView}>
          <Image
            resizeMode={"contain"}
            style={[styles.visibility, { tintColor: AppColors.primaryColor }]}
            source={require("../../../assets/images/visibility.png")}
          />
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            style={[
              styles.numOfViews,
              {
                color: AppColors.primaryColor,
                width: wp(5),
              },
            ]}
          >
            {" "}
            {item.item.numOfViews}
          </Text>
        </View> */}
      </TouchableOpacity>
    );
  }

  renderArticle(item) {
    // AppUtils.console("renderItem", item.item)
    let isBookMark = !item.item.userArticle
      ? false
      : item.item.userArticle.isBookedMark;

    return (
      <TouchableOpacity
        onPress={() => Actions.ArticleWebView({ data: item.item })}
        underlayColor="transparent"
        style={styles.articleHead}
      >
        <View style={{ flexDirection: "column", margin: hp(1) }}>
          <View style={styles.articleSub}>
            <CachedImage
              style={styles.articleImage}
              source={{
                uri: item.item.image
                  ? item.item.image
                  : "https://myclnq.co/wp-content/uploads/2020/06/singapore-consult-doctor-online.png",
              }}
            />
            <View style={styles.articleBookMark}>
              <Image
                resizeMode={"contain"}
                style={styles.articleBookMarkImage}
                source={
                  isBookMark
                    ? require("../../../assets/images/bookmark.png")
                    : require("../../../assets/images/addBookMark.png")
                }
              />
            </View>
            <View style={{ flexDirection: "column" }}>
              <Text
                allowFontScaling={false}
                numberOfLines={3}
                style={styles.articleTitle}
              >
                {item.item.title}
              </Text>

              <View style={styles.articleBottom}>
                <View style={styles.articleTopic}>
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={styles.topicText}
                  >
                    {item.item.topic.toUpperCase()}
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <Image
                    resizeMode={"contain"}
                    style={styles.visibility}
                    source={require("../../../assets/images/visibility.png")}
                  />
                  <Text
                    allowFontScaling={false}
                    numberOfLines={1}
                    style={styles.numOfViews}
                  >
                    {" "}
                    {item.item.numOfViews}
                  </Text>
                </View>

                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  style={styles.publishedOn}
                >
                  {" "}
                  {AppUtils.daysCalculation(item.item.publishedOn)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderIOS() {
    const cellWidth = AppUtils.screenWidth / 3;
    return (
      <ElevatedView
        style={[styles.headerStyle, { flexDirection: "row" }]}
        elevation={5}
      >
        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            flexDirection: "row",
            alignItems: "center",
            paddingTop: AppUtils.isIphone ? (AppUtils.isX ? 0 : 16) : 0,
          }}
        >
          <TouchableHighlight
            underlayColor="transparent"
            onPress={this.goBack}
            testID={"drawer"}
          >
            {this.state.searchView ? (
              <Image
                style={{
                  height: moderateScale(15),
                  width: moderateScale(15),
                  marginTop: AppUtils.isX ? 16 + 18 : 0,
                  marginLeft: wp(5),
                  tintColor: AppColors.blackColor,
                }}
                source={require("../../../assets/images/close.png")}
              />
            ) : (
              <Image
                style={{
                  height: moderateScale(20),
                  width: moderateScale(20),
                  marginTop: AppUtils.isX ? 16 + 18 : 0,
                  marginLeft: wp(5),
                  tintColor: AppColors.blackColor,
                }}
                source={require("../../../assets/images/home.png")}
              />
            )}
          </TouchableHighlight>
        </View>
        <View
          style={{
            width: cellWidth,
            height: hp("6"),
            marginTop: hp("1"),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text allowFontScaling={false} style={styles.headerTextIOS}>
            {this.props.title}
          </Text>
        </View>
        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: "flex-end",
            flexDirection: "row",
            alignItems: "center",
            paddingTop: AppUtils.isIphone ? (AppUtils.isX ? 0 : 16) : 0,
          }}
        >
          {this.state.searchView ? null : (
            <TouchableOpacity
              onPress={() =>
                this.setState({
                  searchView: !this.state.searchView,
                  showSuggestion: true,
                })
              }
              underlayColor="transparent"
              style={{ marginRight: 12 }}
            >
              <Image
                resizeMode={"contain"}
                style={{
                  height: moderateScale(25),
                  width: moderateScale(25),
                  marginRight: wp(1),
                  marginTop: AppUtils.isX ? 16 + 18 : 0,
                }}
                source={images.searchIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </ElevatedView>
    );
  }

  goBack() {
    if (this.state.searchView) {
      this.setState(
        {
          searchView: false,
          searchText: "",
          showSuggestion: true,
          articleList: [],
          page: 1,
        },
        () => {
          this.getArticle();
        }
      );
    } else {
      Actions.MainScreen();
    }
  }

 async settingsHandler(){
    const loggedInUserData =    await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS);
    console.log(loggedInUserData,'loggedInUserData')
    if (loggedInUserData) {
      
      Actions.Settings()
    }
    else{
     Alert.alert(
      '',
      strings('common.common.completeProfile'),
      [
        {
          text: 'Cancel',
          onPress: () => {
            // Handle cancel action if needed
            console.log('Cancel pressed');
          },
          style: 'cancel',
        },
        {
          text: 'Complete Profile',
          onPress: () => {
            Actions.UserSignUp({ isNewUser: true, userDetail: googleUserDetails });
          },
        },
      ],
      { cancelable: true }
    );
    }
  
  }

  renderAndroid() {
    const cellWidth = AppUtils.screenWidth / 3;
    return (
      <ElevatedView
        style={[styles.headerStyle, { flexDirection: "row" }]}
        elevation={5}
      >
        <TouchableHighlight
          onPress={this.goBack}
          underlayColor="transparent"
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: "center",
            //backgroundColor: '#f18867',
          }}
        >
          {this.state.searchView ? (
            <Image
              style={{
                height: moderateScale(15),
                width: moderateScale(15),
                marginTop: AppUtils.isX ? 16 + 18 : 0,
                marginLeft: wp(5),
                tintColor: AppColors.blackColor,
              }}
              source={require("../../../assets/images/close.png")}
            />
          ) : (
            <Image
              style={{
                height: moderateScale(20),
                width: moderateScale(20),
                marginTop: AppUtils.isX ? 16 + 18 : 0,
                marginLeft: wp(5),
                tintColor: AppColors.blackColor,
              }}
              source={require("../../../assets/images/home.png")}
            />
          )}
        </TouchableHighlight>

        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: "center",
          }}
        >
          <Text allowFontScaling={false} style={styles.headerTextIOS}>
            {this.props.title}
          </Text>
        </View>

        <View
          style={{
            width: cellWidth,
            height: AppUtils.headerHeight,
            justifyContent: "flex-end",
            flexDirection: "row",
            alignItems: "center",
            paddingTop: AppUtils.isIphone ? (AppUtils.isX ? 0 : 16) : 0,
          }}
        >
          {this.state.searchView ? null : (
            <TouchableOpacity
              onPress={() =>
                this.setState({ searchView: !this.state.searchView })
              }
              underlayColor="transparent"
              style={{ marginRight: 12 }}
            >
              <Image
                resizeMode={"contain"}
                style={{
                  height: moderateScale(25),
                  width: moderateScale(25),
                  marginRight: wp(1),
                  marginTop: AppUtils.isX ? 16 + 18 : 0,
                }}
                source={images.searchIcon}
              />
            </TouchableOpacity>
          )}
          <TouchableHighlight
            onPress={() =>this.settingsHandler()}
            underlayColor="transparent"
            style={{ marginRight: 8 }}
          >
            <Image
              style={{
                height: moderateScale(25),
                width: moderateScale(25),
                marginTop: AppUtils.isX ? 16 + 18 : 0,
              }}
              resizeMode={"contain"}
              Î
              source={require("../../../assets/images/setting.png")}
            />
          </TouchableHighlight>
        </View>
      </ElevatedView>
    );
  }

  suggestionList(item) {
    AppUtils.console("itemSuggestion", item.index);
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState(
            { searchText: item.item.topic, showSuggestion: false, page: 1 },
            () => {
              this.getArticle();
            }
          );
        }}
        style={{
          alignContent: "center",
          height: hp(6),
          borderColor: AppColors.greyBorder,
          flexDirection: "row",
          borderTopWidth: hp(0),
          borderBottomWidth:
            this.state.suggestionList.length - 1 === item.index ? 0 : hp(0.1),
          borderLeftWidth: hp(0),
          borderRightWidth: hp(0),
          padding: hp(2),
        }}
      >
        <Image
          resizeMode={"contain"}
          style={styles.recentIcon}
          source={require("../../../assets/images/hashtag.png")}
        />
        <Text allowFontScaling={false} style={styles.recentTitle}>
          {item.item.topic}
        </Text>
      </TouchableOpacity>
    );
  }

  onChangeSearch(data) {
    let self = this;
    if (data == "") {
      self.setState({ searchText: data, showSuggestion: true });
    } else {
      self.setState({ searchText: data, showSuggestion: false, page: 1 }, () =>
        self.getArticle()
      );
    }
  }

  searchView() {
    return (
      <View>
        <View style={styles.searchViewMain}>
          <TextInput
            allowFontScaling={false}
            placeholder={"Search"}
            style={styles.searchInputStyle}
            value={this.state.searchText}
            onChangeText={(val) => this.onChangeSearch(val)}
          />
          <Image
            style={styles.searchIcon}
            source={require("../../../assets/images/search.png")}
          />
        </View>
        {this.state.showSuggestion ? (
          <View
            style={{
              backgroundColor: AppColors.whiteColor,
              margin: hp(2),
              marginTop: hp(0.5),
            }}
          >
            <TouchableOpacity style={styles.searchTopicText}>
              <Text allowFontScaling={false} style={styles.searchTopics}>
                {"Topics"}
              </Text>
            </TouchableOpacity>
            <FlatList
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
              style={{
                height: hp(25),
                borderWidth: hp(0.1),
                borderColor: AppColors.greyBorder,
              }}
              data={this.state.suggestionList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={(item, index) => this.suggestionList(item, index)}
              extraData={this.state}
            />
          </View>
        ) : null}
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: AppColors.whiteColor }}>
        {AppUtils.isIphone ? this.renderIOS() : this.renderAndroid()}

        {this.state.searchView ? (
          this.searchView()
        ) : (
          <View style={{ marginBottom: hp(1) }}>
            <Text
              allowFontScaling={false}
              numberOfLines={2}
              style={styles.topViewtitle}
            >
              {strings("string.article.most_view")}
            </Text>
            <FlatList
              style={{ marginTop: hp(1) }}
              data={this.state.topArticle}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={(item) => this.renderTopArticle(item)}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        )}

        <Text
          allowFontScaling={false}
          numberOfLines={2}
          style={styles.latestTitle}
        >
          {strings("string.article.articles")}
        </Text>

        <FlatList
          showsVerticalScrollIndicator={false}
          style={{ marginTop: hp(1) }}
          data={this.state.articleList}
          renderItem={(item) => this.renderArticle(item)}
          keyExtractor={(item, index) => index.toString()}
          onEndReachedThreshold={0.5}
          onEndReached={() => this.getArticle(false)}
          scrollEnabled={true}
        />
        <View style={{ height: hp(2) }} />

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
}

export default ArticleHome;
