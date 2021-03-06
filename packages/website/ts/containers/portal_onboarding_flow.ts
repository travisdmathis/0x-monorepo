import { BigNumber } from '@0xproject/utils';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Blockchain } from 'ts/blockchain';
import { ActionTypes, ProviderType, TokenByAddress, TokenStateByAddress } from 'ts/types';

import { PortalOnboardingFlow as PortalOnboardingFlowComponent } from 'ts/components/onboarding/portal_onboarding_flow';
import { State } from 'ts/redux/reducer';

interface PortalOnboardingFlowProps {
    trackedTokenStateByAddress: TokenStateByAddress;
    blockchain: Blockchain;
    refetchTokenStateAsync: (tokenAddress: string) => Promise<void>;
}

interface ConnectedState {
    networkId: number;
    stepIndex: number;
    isRunning: boolean;
    userAddress: string;
    hasBeenSeen: boolean;
    providerType: ProviderType;
    injectedProviderName: string;
    blockchainIsLoaded: boolean;
    userEtherBalanceInWei?: BigNumber;
    tokenByAddress: TokenByAddress;
}

interface ConnectedDispatch {
    updateIsRunning: (isRunning: boolean) => void;
    updateOnboardingStep: (stepIndex: number) => void;
}

const mapStateToProps = (state: State, _ownProps: PortalOnboardingFlowProps): ConnectedState => ({
    networkId: state.networkId,
    stepIndex: state.portalOnboardingStep,
    isRunning: state.isPortalOnboardingShowing,
    userAddress: state.userAddress,
    providerType: state.providerType,
    injectedProviderName: state.injectedProviderName,
    blockchainIsLoaded: state.blockchainIsLoaded,
    userEtherBalanceInWei: state.userEtherBalanceInWei,
    tokenByAddress: state.tokenByAddress,
    hasBeenSeen: state.hasPortalOnboardingBeenSeen,
});

const mapDispatchToProps = (dispatch: Dispatch<State>): ConnectedDispatch => ({
    updateIsRunning: (isRunning: boolean): void => {
        dispatch({
            type: ActionTypes.UpdatePortalOnboardingShowing,
            data: isRunning,
        });
    },
    updateOnboardingStep: (stepIndex: number): void => {
        dispatch({
            type: ActionTypes.UpdatePortalOnboardingStep,
            data: stepIndex,
        });
    },
});

export const PortalOnboardingFlow: React.ComponentClass<PortalOnboardingFlowProps> = connect(
    mapStateToProps,
    mapDispatchToProps,
)(PortalOnboardingFlowComponent);
