import React, {useState} from 'react';
import {postFeedback} from '../restapi';

export default () => {
    const ASK_FOR_FEEDBACK = 0;
    const GIVING_FEEDBACK = 1;
    const FEEDBACK_GIVEN = 2;

    const [flowStatus, setFlowStatus] = useState(ASK_FOR_FEEDBACK);
    const [feedbackText, setFeedbackText] = useState('');

    const onFeedbackAccepted = () => {
        setFlowStatus(GIVING_FEEDBACK);
    };

    const onSumbit = () => {
        setFlowStatus(FEEDBACK_GIVEN);
        postFeedback(feedbackText).catch((err) => console.log(err));
    };

    const onCancel = () => {
        setFlowStatus(FEEDBACK_GIVEN);
    };

    switch (flowStatus) {
    case ASK_FOR_FEEDBACK:
        return <div
            className='feedback_container teal darken-2'
            onClick={onFeedbackAccepted}>
            <div className='feedback_prompt'>
            I have doubts, because...
            </div>
        </div>;
    case GIVING_FEEDBACK:
        return <div
            className='feedback_form_container teal darken-2'>
            <div className='feedback_header'>Please, tell us more</div>
            <textarea
                className='feedback_input'
                maxLength="1000"
                value = {feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
            ></textarea>
            <div className='feedback_buttons'>
                <input
                    className='feedback_submit'
                    type="button"
                    value="Submit"
                    onClick={onSumbit} />
                <input
                    className='feedback_submit'
                    type="button"
                    value="Cancel"
                    onClick={onCancel} />
            </div>
        </div>;
    default:
        return <div></div>;
    }
};
