import React from 'react';
import {AppColors} from '../shared/AppColors'
import {ActivityIndicator, Dimensions, View} from 'react-native';
import {verticalScale} from "../utils/Scaling";

const {width, height} = Dimensions.get('window');


const Spinner = props => {
    const {
        visible,
        ...attributes
    } = props;

    return (
        visible ? (
            <View style={{
                height: (height - verticalScale(5)), width: width, position: 'absolute', zIndex: 5,
                justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor: AppColors.loader
            }}
            >

                <ActivityIndicator
                    size="small"
                    style={{zIndex: 100, marginBottom: verticalScale(20)}}
                    animating={visible}
                    color={AppColors.primaryColor}/>


            </View>

        ) : (<View/>)

    )

}

export default Spinner;