import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { URLS } from '../../../config'
import { ReactComponent as DropDown } from '../../../assets/icons/ic-dropdown-filled.svg'
import { ReactComponent as Search } from '../../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../../assets/icons/ic-error.svg'
import {
    ApiResourceGroupType,
    K8SObjectChildMapType,
    K8SObjectMapType,
    K8sObjectOptionType,
    SidebarType,
} from '../Types'
import { AggregationKeys } from '../../app/types'
import { COMMON_RESOURCE_FILTER_STYLE, K8S_EMPTY_GROUP, SIDEBAR_KEYS } from '../Constants'
import { Progressing } from '../../common'
import ReactSelect, { InputActionMeta } from 'react-select'
import { Option } from '../../v2/common/ReactSelect.utils'
import { FormatOptionLabelMeta } from 'react-select/dist/declarations/src/Select'
import { ResourceValueContainerWithIcon } from './ResourceList.component'

export function Sidebar({
    k8SObjectMap,
    selectedResource,
    handleGroupHeadingClick,
    setSelectedResource,
    updateResourceSelectionData,
}: SidebarType) {
    const { push } = useHistory()
    const { clusterId, namespace, nodeType, group } = useParams<{
        clusterId: string
        namespace: string
        nodeType: string
        node: string
        group: string
    }>()
    const sideBarElementRef = useRef<HTMLDivElement>(null)
    const [searchText, setSearchText] = useState('')
    const [searchApplied, setSearchApplied] = useState(false)
    const [isMenuOpen, setMenuOpen] = useState(false)
    const [k8sObjectOptionsList, setK8sObjectOptionsList] = useState<K8sObjectOptionType[]>([])

    useEffect(() => {
        if (k8SObjectMap?.size) {
            if (sideBarElementRef.current) {
                sideBarElementRef.current.scrollIntoView({ block: 'center' })
            }

            if (!k8sObjectOptionsList.length) {
                setK8sObjectOptionsList(
                    [...k8SObjectMap.values()].flatMap((k8sObject) => {
                        return [...k8sObject.child.entries()].flatMap(([key, value]) => {
                            const keyLowerCased = key.toLowerCase()
                            if (
                                keyLowerCased === 'node' ||
                                keyLowerCased === SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase() ||
                                keyLowerCased === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()
                            ) {
                                return []
                            }

                            return value.data.map((childData) => {
                                return {
                                    label: childData.gvk.Kind,
                                    value: childData.gvk.Group || K8S_EMPTY_GROUP,
                                    dataset: {
                                        group: childData.gvk.Group,
                                        version: childData.gvk.Version,
                                        kind: childData.gvk.Kind,
                                        namespaced: `${childData.namespaced}`,
                                        grouped: `${k8sObject.child.size > 1}`,
                                    },
                                    groupName: value.data.length === 1 ? k8sObject.name : `${k8sObject.name}/${key}`,
                                }
                            })
                        })
                    }),
                )
            }
        }
    }, [k8SObjectMap?.size, sideBarElementRef.current])

    const selectNode = (e: any, groupName?: string): void => {
        const _selectedKind = e.currentTarget.dataset.kind.toLowerCase()
        const _selectedGroup = e.currentTarget.dataset.group.toLowerCase()

        if (_selectedKind === nodeType && (group === _selectedGroup || group === K8S_EMPTY_GROUP)) {
            return
        }

        push(`${URLS.RESOURCE_BROWSER}/${clusterId}/${namespace}/${_selectedKind}/${_selectedGroup || K8S_EMPTY_GROUP}`)
        const _selectedResource = {
            namespaced: e.currentTarget.dataset.namespaced === 'true',
            gvk: {
                Group: e.currentTarget.dataset.group,
                Version: e.currentTarget.dataset.version,
                Kind: e.currentTarget.dataset.kind,
            },
            isGrouped: e.currentTarget.dataset.grouped === 'true',
        }
        setSelectedResource(_selectedResource)
        updateResourceSelectionData(_selectedResource)

        if (groupName) {
            handleGroupHeadingClick(
                {
                    currentTarget: {
                        dataset: {
                            groupName: groupName,
                        },
                    },
                },
                true,
            )
        }
    }

    const updateRef = (_node: HTMLDivElement) => {
        if (_node?.dataset?.selected === 'true') {
            sideBarElementRef.current = _node
        }
    }

    const renderChild = (childData: ApiResourceGroupType, useGroupName?: boolean) => {
        const nodeName = useGroupName && childData.gvk.Group ? childData.gvk.Group : childData.gvk.Kind
        const isSelected =
            useGroupName && childData.gvk.Group
                ? selectedResource?.gvk?.Group === childData.gvk.Group
                : nodeType === childData.gvk.Kind.toLowerCase()
        return (
            <div
                key={nodeName}
                ref={updateRef}
                className={`fs-13 pointer dc__ellipsis-right fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                    useGroupName ? 'ml-16' : ''
                } ${isSelected ? 'bcb-1 cb-5' : 'cn-7 resource-tree-object'}`}
                data-group={childData.gvk.Group}
                data-version={childData.gvk.Version}
                data-kind={childData.gvk.Kind}
                data-namespaced={childData.namespaced}
                data-grouped={useGroupName}
                data-selected={isSelected}
                onClick={selectNode}
            >
                {nodeName}
            </div>
        )
    }

    const renderK8sResourceChildren = (key: string, value: K8SObjectChildMapType, k8sObject: K8SObjectMapType) => {
        const keyLowerCased = key.toLowerCase()
        if (
            keyLowerCased === 'node' ||
            keyLowerCased === SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase() ||
            keyLowerCased === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()
        ) {
            return null
        } else if (value.data.length === 1) {
            return renderChild(value.data[0])
        } else {
            return (
                <>
                    <div
                        className="flex pointer"
                        data-group-name={`${k8sObject.name}/${key}`}
                        onClick={handleGroupHeadingClick}
                    >
                        <DropDown
                            className={`${value.isExpanded ? 'fcn-9' : 'fcn-5'}  rotate icon-dim-24 pointer`}
                            style={{
                                ['--rotateBy' as any]: value.isExpanded ? '0deg' : '-90deg',
                            }}
                        />
                        <span className={`fs-14 ${value.isExpanded ? 'fw-6' : 'fw-4'} pointer w-100 pt-6 pb-6`}>
                            {key}
                        </span>
                    </div>
                    {value.isExpanded && value.data.map((_child) => renderChild(_child, true))}
                </>
            )
        }
    }

    const handleSearchInput = (e) => {
        setSearchText(e.target.value)
        setSearchApplied(!!e.target.value)
    }

    const clearSearchInput = () => {
        setSearchText('')
        setSearchApplied(false)
    }

    const handleInputChange = (newValue: string, actionMeta: InputActionMeta): void => {
        if (actionMeta.action === 'input-change') {
            setSearchText(newValue)
            setSearchApplied(!!newValue)
            setMenuOpen(!!newValue)
        }
    }

    const hideMenu = () => {
        setMenuOpen(false)
        setSearchText('')
        setSearchApplied(false)
    }

    const handleOnChange = (option: K8sObjectOptionType): void => {
        hideMenu()
        selectNode(
            {
                currentTarget: {
                    dataset: option.dataset,
                },
            },
            option.groupName,
        )
    }

    function formatOptionLabel(option: K8sObjectOptionType, formatOptionLabelMeta: FormatOptionLabelMeta<any>) {
        return (
            <div className="flex left column">
                {!formatOptionLabelMeta.inputValue ? (
                    <span className="w-100 dc__ellipsis-right">{option.label}</span>
                ) : (
                    <span
                        className="w-100 dc__ellipsis-right"
                        dangerouslySetInnerHTML={{
                            __html: option.label.replace(
                                new RegExp(formatOptionLabelMeta.inputValue, 'gi'),
                                (highlighted) => `<mark>${highlighted}</mark>`,
                            ),
                        }}
                    />
                )}
            </div>
        )
    }

    function customFilter(option, searchText) {
        return option.data.label.toLowerCase().includes(searchText.toLowerCase())
    }

    const noOptionsMessage = () => 'No matching kind'

    return !k8SObjectMap?.size ? (
        <Progressing pageLoader />
    ) : (
        <div className="k8s-object-container">
            <div className="bcn-0 pt-16 pb-12 pl-20 pr-20">
                <ReactSelect
                    placeholder="Search Kind"
                    options={k8sObjectOptionsList}
                    value={null}
                    inputValue={searchText}
                    onInputChange={handleInputChange}
                    onChange={handleOnChange}
                    onBlur={hideMenu}
                    menuIsOpen={isMenuOpen}
                    formatOptionLabel={formatOptionLabel}
                    filterOption={customFilter}
                    noOptionsMessage={noOptionsMessage}
                    classNamePrefix="kind-search-select"
                    styles={COMMON_RESOURCE_FILTER_STYLE}
                    components={{
                        ClearIndicator: null,
                        IndicatorSeparator: null,
                        DropdownIndicator: null,
                        Option,
                        ValueContainer: ResourceValueContainerWithIcon,
                    }}
                />
            </div>
            <div className="k8s-object-wrapper p-8 dc__user-select-none">
                {[...k8SObjectMap.values()].map((k8sObject) =>
                    k8sObject.name === AggregationKeys.Events ? null : (
                        <Fragment key={k8sObject.name}>
                            <div
                                className="flex pointer"
                                data-group-name={k8sObject.name}
                                onClick={handleGroupHeadingClick}
                            >
                                <DropDown
                                    className={`${
                                        k8sObject.isExpanded ? 'fcn-9' : 'fcn-5'
                                    }  rotate icon-dim-24 pointer`}
                                    style={{ ['--rotateBy' as any]: !k8sObject.isExpanded ? '-90deg' : '0deg' }}
                                />
                                <span className="fs-14 fw-6 pointer w-100 pt-6 pb-6">{k8sObject.name}</span>
                            </div>
                            {k8sObject.isExpanded && (
                                <div className="pl-20">
                                    {[...k8sObject.child.entries()].map(([key, value]) =>
                                        renderK8sResourceChildren(key, value, k8sObject),
                                    )}
                                </div>
                            )}
                        </Fragment>
                    ),
                )}
                <div className="dc__border-top-n1 pt-8">
                    {SIDEBAR_KEYS.eventGVK.Version && (
                        <div
                            key={SIDEBAR_KEYS.eventGVK.Kind}
                            ref={updateRef}
                            className={`fs-13 pointer dc__ellipsis-right fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                                nodeType === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()
                                    ? 'bcb-1 cb-5'
                                    : 'cn-7 resource-tree-object'
                            }`}
                            data-group={SIDEBAR_KEYS.eventGVK.Group}
                            data-version={SIDEBAR_KEYS.eventGVK.Version}
                            data-kind={SIDEBAR_KEYS.eventGVK.Kind}
                            data-namespaced={true}
                            data-selected={nodeType === SIDEBAR_KEYS.eventGVK.Kind.toLowerCase()}
                            onClick={selectNode}
                        >
                            {SIDEBAR_KEYS.events}
                        </div>
                    )}
                    {SIDEBAR_KEYS.namespaceGVK.Version && (
                        <div
                            key={SIDEBAR_KEYS.namespaceGVK.Kind}
                            ref={updateRef}
                            className={`fs-13 pointer dc__ellipsis-right fw-4 pt-6 lh-20 pr-8 pb-6 pl-8 ${
                                nodeType === SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase()
                                    ? 'bcb-1 cb-5'
                                    : 'cn-7 resource-tree-object'
                            }`}
                            data-group={SIDEBAR_KEYS.namespaceGVK.Group}
                            data-version={SIDEBAR_KEYS.namespaceGVK.Version}
                            data-kind={SIDEBAR_KEYS.namespaceGVK.Kind}
                            data-namespaced={false}
                            data-selected={nodeType === SIDEBAR_KEYS.namespaceGVK.Kind.toLowerCase()}
                            onClick={selectNode}
                        >
                            {SIDEBAR_KEYS.namespaces}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
