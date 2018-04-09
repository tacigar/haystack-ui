/*
 * Copyright 2018 Expedia, Inc.
 *
 *       Licensed under the Apache License, Version 2.0 (the "License");
 *       you may not use this file except in compliance with the License.
 *       You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an "AS IS" BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import _ from 'lodash';
import {Link} from 'react-router-dom';

import formatters from '../../../utils/formatters';

@observer
export default class AlertHistory extends React.Component {
    static propTypes = {
        alertDetailsStore: PropTypes.object.isRequired,
        operationName: PropTypes.string.isRequired,
        serviceName: PropTypes.string.isRequired
    };

    static timeAgoFormatter(cell) {
        return formatters.toTimeago(cell);
    }

    static timestampFormatter(cell) {
        return formatters.toTimestring(cell);
    }

    static durationColumnFormatter(start, end) {
        return formatters.toDurationStringInSecAndMin(end - start);
    }

    constructor(props) {
        super(props);

        this.trendLinkCreator = this.trendLinkCreator.bind(this);
        this.traceLinkCreator = this.traceLinkCreator.bind(this);
    }

    trendLinkCreator(startTimestamp, endTimestamp) {
        return `/service/${this.props.serviceName}/trends?operationName=^${encodeURIComponent(this.props.operationName)}$&from=${startTimestamp / 1000}&until=${endTimestamp / 1000}`;
    }

    traceLinkCreator(startTimestamp, endTimestamp) {
        return `/service/${this.props.serviceName}/traces?operationName=${encodeURIComponent(this.props.operationName)}&startTime=${startTimestamp / 1000}&endTime=${endTimestamp / 1000}`;
    }

    render() {
        const sortedHistoryResults = _.orderBy(this.props.alertDetailsStore.alertHistory, alert => alert.startTimestamp, ['desc']);

        return (
            <div className="col-md-6 alert-history">
                <h4>History</h4>
                <table className="table">
                    <thead>
                    <tr>
                        <th width="50%">Start Time</th>
                        <th width="20%" className="text-right">Duration</th>
                        <th width="30%" className="text-right">See Trends & Traces</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedHistoryResults.length ? sortedHistoryResults.map(alert =>
                            (<tr className="non-highlight-row" key={Math.random()}>
                                <td><span className="alerts__bold">{AlertHistory.timeAgoFormatter(alert.startTimestamp)}</span> at {AlertHistory.timestampFormatter(alert.startTimestamp)}</td>
                                <td className="text-right"><span className="alerts__bold">{AlertHistory.durationColumnFormatter(alert.startTimestamp, alert.endTimestamp)}</span></td>
                                <td className="text-right">
                                    <div className="btn-group btn-group-sm">
                                        <Link to={this.trendLinkCreator(alert.startTimestamp, alert.endTimestamp)} className="btn btn-default">
                                            <span className="ti-stats-up"/>
                                        </Link>
                                        <Link to={this.traceLinkCreator(alert.startTimestamp, alert.endTimestamp)} className="btn btn-sm btn-default">
                                            <span className="ti-align-left"/>
                                        </Link>
                                    </div>
                                </td>
                            </tr>))
                        : (<tr className="non-highlight-row"><td>No past alert found</td><td/><td/></tr>)
                    }
                    </tbody>
                </table>
            </div>
        );
    }
}
