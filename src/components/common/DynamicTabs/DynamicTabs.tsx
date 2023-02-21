import React, { Fragment, useEffect, useRef, useState } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { ReactComponent as Cross } from '../../../assets/icons/ic-cross.svg'
import Tippy from '@tippyjs/react'
import { ConditionalWrap, stopPropagation } from '../helpers/Helpers'
import './DynamicTabs.scss'
import ReactSelect, { components } from 'react-select'
import { getCustomOptionSelectionStyle } from '../../v2/common/ReactSelect.utils'
import {
    COMMON_TABS_SELECT_STYLES,
    computeAndToggleMoreOptions,
    EMPTY_TABS_DATA,
    initTabsData,
} from './DynamicTabs.utils'
import { TabsDataType } from './DynamicTabs.type'

/**
 * This component enables a way to display dynamic tabs with the following functionalities,
 * - Can make certain tabs fixed
 * - Takes the parent's width as init reference to identify stop width
 * - Shows more options CTA when there's no available width to display all tabs
 * - Scrollable tabs section by default
 *
 * Note: To be used with useTabs hook
 */
export function DynamicTabs({ tabs, removeTabByIdentifier }) {
    const { push } = useHistory()
    const [selectedTab, setSelectedTab] = useState(null)
    const tabsSectionRef = useRef<HTMLDivElement>(null)
    const fixedContainerRef = useRef<HTMLDivElement>(null)
    const dynamicWrapperRef = useRef<HTMLUListElement>(null)
    const tabRef = useRef<HTMLAnchorElement>(null)
    const [tabsData, setTabsData] = useState<TabsDataType>(EMPTY_TABS_DATA)

    useEffect(() => {
        const resizeHandler = () => {
            computeAndToggleMoreOptions(tabsSectionRef, fixedContainerRef, dynamicWrapperRef)
        }

        window.addEventListener('resize', resizeHandler)
        return (): void => {
            window.addEventListener('resize', resizeHandler)
        }
    }, [])

    useEffect(() => {
        initTabsData(tabs, setTabsData, setSelectedTab)
    }, [tabs])

    useEffect(() => {
        if (tabsData.fixedTabs.length > 0 || tabsData.dynamicTabs.length > 0) {
            computeAndToggleMoreOptions(tabsSectionRef, fixedContainerRef, dynamicWrapperRef)
        }
    }, [tabsData])

    const handleCloseTab = (e: any, tabIdentifier: string) => {
        e.stopPropagation()
        const pushURL = removeTabByIdentifier(tabIdentifier)
        setTimeout(() => {
            if (pushURL) {
                push(pushURL)
            }
        }, 1)
    }

    const updateRef = (_node: HTMLAnchorElement) => {
        if (_node?.dataset?.selected === 'true') {
            tabRef.current = _node
        }
    }

    const getTabNavLink = (tab) => {
        return (
            <NavLink
                to={tab.url}
                ref={updateRef}
                className="dynamic-tab__resource cursor cn-9 dc__no-decor m-0-imp dc__ellipsis-right"
                data-selected={tab.isSelected}
            >
                <div
                    className={`flex left ${tab.isSelected ? 'cn-9' : ''} ${
                        tab.isDeleted ? 'dynamic-tab__deleted cr-5' : ''
                    }`}
                >
                    <span className="fs-12 fw-6 lh-20 dc__ellipsis-right">{tab.name}</span>
                </div>
            </NavLink>
        )
    }

    const handleTabCloseAction = (e) => {
        handleCloseTab(e, e.currentTarget.dataset.title)
    }

    const getTabTippyContent = (title: string) => {
        const _titleSplit = title.split('/')

        return (
            <div className="w-200">
                <h2 className="fs-12 fw-6 lh-18 m-0 dc__word-break">{_titleSplit[0]}</h2>
                {_titleSplit[1] && <p className="fs-12 fw-4 lh-18 mt-4 mb-0 dc__word-break">{_titleSplit[1]}</p>}
            </div>
        )
    }

    const renderTab = (tab, idx: number, isFixed?: boolean) => {
        return (
            <Fragment key={`${idx}-tab`}>
                <li
                    id={tab.name}
                    className={`${isFixed ? 'fixed-tab' : 'dynamic-tab'}  flex left flex-grow-1 ${
                        tab.isSelected ? 'dynamic-tab__item-selected' : ''
                    }`}
                >
                    <ConditionalWrap
                        condition={!isFixed}
                        wrap={(chilldren) => (
                            <Tippy
                                className="default-tt dc_max-width__max-content"
                                arrow={false}
                                placement="top"
                                content={getTabTippyContent(tab.title)}
                                trigger="mouseenter"
                                duration={[600, 0]}
                            >
                                {chilldren}
                            </Tippy>
                        )}
                    >
                        <div className="flex w-100">
                            <div
                                className={`w-100 ${
                                    tab.isSelected ? 'dynamic-tab-selected bcn-0 cn-9' : ''
                                } flex left pl-12 pt-8 pb-8 pr-12`}
                            >
                                {getTabNavLink(tab)}
                                {!isFixed && (
                                    <div className="dynamic-tab__close flex br-5  ml-8">
                                        <Cross
                                            data-title={tab.title}
                                            onClick={handleTabCloseAction}
                                            className="icon-dim-16 cursor"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </ConditionalWrap>
                </li>
                <div className={` ${!tab.isSelected || !(tab.isSelected && idx - 1) ? 'dynamic-tab__border' : ''}`} />
            </Fragment>
        )
    }

    const TabsOption = (props) => {
        const { selectProps, data } = props
        selectProps.styles.option = getCustomOptionSelectionStyle({
            display: 'flex',
            alignItems: 'center',
        })

        const splittedLabel = data.label.split('/')
        const regex = new RegExp(splittedLabel[0], 'gi')

        return (
            <div onClick={stopPropagation}>
                <components.Option {...props}>
                    <div className="tab-option__select dc__highlight-text">
                        <small
                            className="cn-7"
                            dangerouslySetInnerHTML={{
                                // __html: splittedLabel[0].replace(regex, highLightText),
                                __html: splittedLabel[0],
                            }}
                        />
                        {splittedLabel[1] && (
                            <div
                                className="w-100 dc__ellipsis-right"
                                dangerouslySetInnerHTML={{
                                    // __html: splittedLabel[1].replace(regex, highLightText),
                                    __html: splittedLabel[1],
                                }}
                            />
                        )}
                    </div>
                    <div className="dynamic-tab__close flex br-5  ml-8">
                        <Cross data-title={data.title} onClick={handleTabCloseAction} className="icon-dim-16 cursor" />
                    </div>
                </components.Option>
            </div>
        )
    }

    const onChangeTab = (option): void => {
        setSelectedTab(option)
        push(option.url)
    }

    return (
        <div
            ref={tabsSectionRef}
            className="dynamic-tabs-section flex left pl-20 pr-20 w-100"
            style={{ outline: 'none' }}
        >
            <div ref={fixedContainerRef} className="fixed-tabs-container">
                <ul className="fixed-tabs-wrapper flex left p-0 m-0">
                    {tabsData.fixedTabs.map((tab, idx) => renderTab(tab, idx, true))}
                </ul>
            </div>
            <div
                className="dynamic-tabs-container"
                style={{
                    maxWidth: fixedContainerRef.current
                        ? `calc(100% - ${fixedContainerRef.current.offsetWidth}px)`
                        : 'calc(100% - 110px)',
                }}
            >
                <ul ref={dynamicWrapperRef} className="dynamic-tabs-wrapper flex left p-0 m-0">
                    {tabsData.dynamicTabs.map((tab, idx) => renderTab(tab, idx))}
                </ul>
            </div>
            <ReactSelect
                className="more-tabs-option"
                value={selectedTab}
                placeholder=""
                options={tabsData.dynamicTabs}
                isSearchable={false}
                onChange={onChangeTab}
                blurInputOnSelect={true}
                components={{
                    IndicatorSeparator: null,
                    Option: TabsOption,
                }}
                styles={COMMON_TABS_SELECT_STYLES}
            />
        </div>
    )
}
