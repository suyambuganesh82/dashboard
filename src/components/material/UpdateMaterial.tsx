import React, { Component } from 'react';
import { updateMaterial } from './material.service';
import { GitMaterialType, UpdateMaterialState } from './material.types'
import { toast } from 'react-toastify';
import { showError } from '../common';
import { MaterialView } from './MaterialView';

interface UpdateMaterialProps {
    appId: number;
    isMultiGit: boolean;
    isCheckoutPathValid;
    material: GitMaterialType;
    providers: any[];
    refreshMaterials: () => void;
}
export class UpdateMaterial extends Component<UpdateMaterialProps, UpdateMaterialState> {

    constructor(props) {
        super(props);
        this.state = {
            material: {
                id: this.props.material.id,
                name: this.props.material.name,
                gitProvider: this.props.material.gitProvider,
                url: this.props.material.url,
                checkoutPath: this.props.material.checkoutPath,
                active: this.props.material.active,
            },
            isCollapsed: true,
            isLoading: false,
            isError: {
                gitProvider: false,
                url: false,
            }
        }
        this.handleProviderChange = this.handleProviderChange.bind(this);
        this.handlePathChange = this.handlePathChange.bind(this);
        this.handleUrlChange = this.handleUrlChange.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
        this.save = this.save.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.material.gitProvider.id != this.props.material.gitProvider.id || prevProps.material.url != this.props.material.url || prevProps.material.checkoutPath != this.props.material.checkoutPath) {
            this.setState({
                material: {
                    id: this.props.material.id,
                    name: this.props.material.name,
                    gitProvider: this.props.material.gitProvider,
                    url: this.props.material.url,
                    active: this.props.material.active,
                    checkoutPath: this.props.material.checkoutPath,
                },
                isCollapsed: true,
                isLoading: false,
            })
        }
    }

    handleProviderChange(selected) {
        this.setState({
            material: {
                ...this.state.material,
                gitProvider: selected
            }
        });
    }

    handlePathChange(event) {
        this.setState({
            material: {
                ...this.state.material,
                checkoutPath: event.target.value
            }
        });
    }

    handleUrlChange(event) {
        this.setState({
            material: {
                ...this.state.material,
                url: event.target.value
            }
        });
    }

    toggleCollapse(event): void {
        this.setState({
            isCollapsed: !this.state.isCollapsed,
        });
    }

    save(event): void {
        this.setState({ isLoading: true });
        let payload = {
            appId: this.props.appId,
            material: {
                id: this.state.material.id,
                url: this.state.material.url,
                checkoutPath: this.state.material.checkoutPath,
                gitProviderId: this.state.material.gitProvider.id,
            }
        }
        updateMaterial(payload).then((response) => {
            this.props.refreshMaterials();
            toast.success("Saved");
        }).catch((error) => {
            showError(error);
        }).finally(() => {
            this.setState({ isLoading: false })
        })
    }

    cancel(event) {
        this.setState({
            material: {
                ...this.state.material,
                gitProvider: this.props.material.gitProvider,
                url: this.props.material.url,
                checkoutPath: this.props.material.checkoutPath,
            },
            isCollapsed: true,
            isLoading: false,
        });
    }

    render() {
        return <MaterialView
            material={this.state.material}
            isError={this.state.isError}
            isCollapsed={this.state.isCollapsed}
            isLoading={this.state.isLoading}
            isMultiGit={this.props.isMultiGit}
            providers={this.props.providers}
            handleProviderChange={this.handleProviderChange}
            handleUrlChange={this.handleUrlChange}
            handlePathChange={this.handlePathChange}
            toggleCollapse={this.toggleCollapse}
            save={this.save}
            cancel={this.cancel}
            isCheckoutPathValid={this.props.isCheckoutPathValid}
        />
    }
}