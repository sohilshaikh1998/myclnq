import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { AppColors } from '../../shared/AppColors';
import { moderateScale } from '../../utils/Scaling';
import ElevatedView from 'react-native-elevated-view';
import images from '../../utils/images';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppStyles } from '../../shared/AppStyles';

const sampleAwards = [
  { id: 1, title: '10K', text: 'Steps' },
  { id: 2, title: '20K', text: 'Steps' },
  { id: 3, title: '30K', text: 'Steps' },
  { id: 4, title: '35K', text: 'Steps' },
];

class Awards extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  cardView(award) {
    return (
      <ElevatedView
        key={award.id}
        elevation={3}
        style={{
          width: moderateScale(96),
          height: moderateScale(98),
          backgroundColor: AppColors.whiteColor,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: wp(1.5),
          marginRight: wp(1.5),
          marginTop: hp(1.5),
          marginBottom: hp(1.5),
        }}
      >
        <Image
          style={{
            height: moderateScale(42),
            width: moderateScale(42),
            resizeMode: 'contain',
          }}
          source={award.id === 1 ? images.awardHighlighted : images.awardNormal}
        />
        <Text style={{ fontSize: 12, fontWeight: '800', color: AppColors.blackColor4, marginTop: hp(1) }}>{award.title}</Text>
        <Text style={{ fontSize: 12, fontWeight: '500', color: AppColors.blackColor5 }}>{award.text}</Text>
      </ElevatedView>
    );
  }
  numberedCard() {
    return (
      <View style={{ backgroundColor: AppColors.buttonPrimarColor, height: moderateScale(12), borderRadius: 20, marginLeft: wp(2) }}>
        <Text style={{ fontSize: 8, fontWeight: '400', color: AppColors.whiteColor, textAlign: 'center', paddingHorizontal: wp(2) }}>06</Text>
      </View>
    );
  }
  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: AppColors.lightGray,
        }}
      >
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(2), marginLeft: wp(5) }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: AppColors.textDarkGray,
                fontFamily: AppStyles.fontFamilyMedium,
              }}
            >
              Daily Steps
            </Text>
            {this.numberedCard()}
          </View>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.scrollView}>
            {sampleAwards.map((award) => this.cardView(award))}
          </ScrollView>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(2), marginLeft: wp(5) }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: AppColors.textDarkGray,
                fontFamily: AppStyles.fontFamilyMedium,
              }}
            >
              Distance
            </Text>
            {this.numberedCard()}
          </View>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.scrollView}>
            {sampleAwards.map((award) => this.cardView(award))}
          </ScrollView>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(2), marginLeft: wp(5) }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: AppColors.textDarkGray,
                fontFamily: AppStyles.fontFamilyMedium,
              }}
            >
              Calories a week
            </Text>
            {this.numberedCard()}
          </View>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.scrollView}>
            {sampleAwards.map((award) => this.cardView(award))}
          </ScrollView>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(2), marginLeft: wp(5) }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '800',
                color: AppColors.textDarkGray,
                fontFamily: AppStyles.fontFamilyMedium,
              }}
            >
              Total days
            </Text>
            {this.numberedCard()}
          </View>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.scrollView}>
            {sampleAwards.map((award) => this.cardView(award))}
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    marginLeft: wp(3),
    marginRight: wp(6),
  },
  text: {
    fontSize: 18,
    color: '#000',
  },
});

export default Awards;
