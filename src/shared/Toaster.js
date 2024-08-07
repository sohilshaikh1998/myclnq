import React from 'react';
import Toast, {DURATION} from 'react-native-easy-toast'

export class Toaster extends React.Component {
    static toastDuration = DURATION;

    static showToast() {
        return (
            <Toast
                ref="errortoast"
                style={{backgroundColor: 'red'}}
                position='top'
                positionValue={150}
                fadeInDuration={750}
                fadeOutDuration={1000}
                opacity={0.8}
                textStyle={{color: 'white'}}
            />
        )
    }
}