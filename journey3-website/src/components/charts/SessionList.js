import React from 'react';
import dayjs from 'dayjs';

export default (props) => {
    const sessions = props.sessions;

    const duration = (start, end) => {
        const from = dayjs(start);
        const to = dayjs(end);

        return to.diff(from, 'minute');
    };

    const session = (s) => <div>
        <b>Version:</b> {s.version},{' '}
        <b>Duration:</b> {duration(s.start, s.end)}{'min, '}
        <b>First launch:</b> {s.fst_launch ? 'Yes' : 'No'}
        <div>
            {s.evt_seq.map((e, idx) => (
                <div key={idx}>{e}</div>
            ))}
        </div>
    </div>;

    return <div className="row">
        <ul className="collection">
            {sessions.map((s) =>
                <li className="collection-item" key={s.id}>
                    {session(s)}
                </li>
            )}
        </ul>
    </div>;
};
