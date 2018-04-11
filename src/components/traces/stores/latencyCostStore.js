/*
 * Copyright 2018 Expedia, Inc.
 *
 *         Licensed under the Apache License, Version 2.0 (the "License");
 *         you may not use this file except in compliance with the License.
 *         You may obtain a copy of the License at
 *
 *             http://www.apache.org/licenses/LICENSE-2.0
 *
 *         Unless required by applicable law or agreed to in writing, software
 *         distributed under the License is distributed on an "AS IS" BASIS,
 *         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *         See the License for the specific language governing permissions and
 *         limitations under the License.
 */

import axios from 'axios';
import {observable, action} from 'mobx';
import { fromPromise } from 'mobx-utils';
import authenticationTimeoutStore from '../../../stores/authenticationTimeoutStore';

function TraceException(data) {
    this.message = 'Unable to resolve promise';
    this.data = data;
}

export class LatencyCostStore {
    @observable latencyCost = [];
    @observable promiseState = null ;
    traceId = null;

    @action fetchLatencyCost(traceId) {
        if (this.traceId === traceId) return;
        this.traceId = traceId;

        this.promiseState = fromPromise(
            axios
            .get(`/api/trace/${traceId}/latencyCost`)
            .then((result) => {
                this.latencyCost = result.data;
            })
            .catch((result) => {
                if (result.response.status === 401) {
                    authenticationTimeoutStore.timedOut = true;
                }
                throw new TraceException(result);
            })
        );
    }
}

export default new LatencyCostStore();
