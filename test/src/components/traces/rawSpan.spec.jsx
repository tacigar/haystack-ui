/*
 * Copyright 2018 Expedia Group
 *
 *       Licensed under the Apache License, Version 2.0 (the License);
 *       you may not use this file except in compliance with the License.
 *       You may obtain a copy of the License at
 *
 *           http://www.apache.org/licenses/LICENSE-2.0
 *
 *       Unless required by applicable law or agreed to in writing, software
 *       distributed under the License is distributed on an AS IS BASIS,
 *       WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *       See the License for the specific language governing permissions and
 *       limitations under the License.
 *
 */

/* eslint-disable react/prop-types, no-unused-expressions */

import React from 'react';
import { expect } from 'chai';
import axios from 'axios';
import { when } from 'mobx';
import MockAdapter from 'axios-mock-adapter';
import { mount } from 'enzyme';
import sinon from 'sinon';

import {RawSpanStore} from '../../../../src/components/traces/stores/rawSpanStore';
import RawSpan from '../../../../src/components/traces/details/timeline/rawSpan';


const fulfilledPromise = {
    case: ({fulfilled}) => fulfilled()
};

const rejectedPromise = {
    case: ({rejected}) => rejected()
};

const pendingPromise = {
    case: ({pending}) => pending()
};

const stubTrace = [{
    traceId: 'test-stub'
}];

function createStubStore(results, promise) {
    const store = new RawSpanStore();
    sinon.stub(store, 'fetchRawSpan', () => {
        store.rawSpan = results;
        promise ? store.promiseState = promise : null;
    });

    return store;
}

describe('RawSpanStore', () => {
    let server = null;
    const store = new RawSpanStore();

    beforeEach(() => {
        server = new MockAdapter(axios);
    });

    afterEach(() => {
        server = null;
    });

    it('fetches raw span from the api', (done) => {
        server.onGet('/api/trace/raw/test-stub/test-span').reply(200, stubTrace);
        store.fetchRawSpan('test-stub', 'test-span');

        when(
            () => store.rawSpan.length > 0,
            () => {
                expect(store.rawSpan).to.have.length(1);
                done();
            });
    });
});

describe('RawSpan', () => {
    it('should render a formatted panel with the raw span from the store', () => {
        const store = createStubStore(stubTrace, fulfilledPromise);
        const wrapper = mount(<RawSpan traceId={'test-stub'} spanId={'test-span'} rawSpanStore={store} />);

        expect(store.fetchRawSpan.callCount).to.equal(1);
        expect(wrapper.find('.raw-span')).to.have.length(1);
    });

    it('should render a formatted panel with the raw span from the store', () => {
        const store = createStubStore(stubTrace, pendingPromise);
        const wrapper = mount(<RawSpan traceId={'test-stub'} spanId={'test-span'} rawSpanStore={store} />);

        expect(store.fetchRawSpan.callCount).to.equal(1);
        expect(wrapper.find('.loading')).to.have.length(1);
        expect(wrapper.find('.raw-span')).to.have.length(0);
    });

    it('should render a formatted panel with the raw span from the store', () => {
        const store = createStubStore(stubTrace, rejectedPromise);
        const wrapper = mount(<RawSpan traceId={'test-stub'} spanId={'test-span'} rawSpanStore={store} />);

        expect(store.fetchRawSpan.callCount).to.equal(1);
        expect(wrapper.find('.error-message_text')).to.have.length(1);
        expect(wrapper.find('.raw-span')).to.have.length(0);
    });
});
