import {
    DEFAULT_BASE_PAGE_SIZE,
    ErrorScreenNotAuthorized,
    ERROR_EMPTY_SCREEN,
    noop,
    Reload,
    TOAST_ACCESS_DENIED,
} from '@devtron-labs/devtron-fe-common-lib'
import React, { useRef } from 'react'
import { API_STATUS_CODES } from '../../../../../config'
import FiltersEmptyState from '../../shared/components/FilterEmptyState/FilterEmptyState.component'
import NoUsers from './NoUsers'
import { UserPermissionContainerProps } from './types'
import UserPermissionListHeader from './UserPermissionListHeader'
import BulkSelectionActionWidget from '../../shared/components/BulkSelection/BulkSelectionActionWidget'
import BulkSelectionModal from '../../shared/components/BulkSelection/BulkSelectionModal'
import UserPermissionTable from './UserPermissionTable'
import { BulkSelectionModalTypes, useAuthorizationBulkSelection } from '../../shared/components/BulkSelection'
import { BulkSelectionEntityTypes } from '../../shared/components/BulkSelection/constants'

const UserPermissionContainer = ({
    showStatus,
    error,
    getUserDataForExport,
    showLoadingState,
    totalCount,
    users,
    refetchUserPermissionList,
    urlFilters,
    bulkSelectionModalConfig,
    setBulkSelectionModalConfig,
}: UserPermissionContainerProps) => {
    const isClearBulkSelectionModalOpen = !!bulkSelectionModalConfig?.type

    const { searchKey, handleSearch: _handleSearch, clearFilters } = urlFilters

    const draggableRef = useRef<HTMLDivElement>()
    const { getSelectedIdentifiersCount, isBulkSelectionApplied } = useAuthorizationBulkSelection()
    const isSomeRowChecked = getSelectedIdentifiersCount() > 0
    const selectedUsersCount = isBulkSelectionApplied ? totalCount : getSelectedIdentifiersCount()

    if (!showLoadingState) {
        if (error) {
            if (error.code === API_STATUS_CODES.PERMISSION_DENIED) {
                return (
                    <ErrorScreenNotAuthorized
                        subtitle={ERROR_EMPTY_SCREEN.REQUIRED_MANAGER_ACCESS}
                        title={TOAST_ACCESS_DENIED.TITLE}
                    />
                )
            }
            return <Reload reload={refetchUserPermissionList} className="flex-grow-1" />
        }

        // The null state is shown only when filters are not applied
        if (totalCount === 0 && !searchKey) {
            return <NoUsers />
        }
    }

    // Disable the filter actions
    const isActionsDisabled = showLoadingState || !(totalCount && users.length)

    const showPagination = totalCount > DEFAULT_BASE_PAGE_SIZE

    const applyFilter = () =>
        new Promise((resolve, reject) => {
            if (isBulkSelectionApplied) {
                setBulkSelectionModalConfig({
                    type: BulkSelectionModalTypes.clearAllAcrossPages,
                    onSuccess: () => resolve(null),
                    onCancel: () => reject(),
                })
            } else {
                resolve(null)
            }
        })

    const handleSearch = (text: string) => {
        applyFilter()
            .then(() => {
                _handleSearch(text)
            })
            .catch(noop)
    }

    return (
        <>
            <div className="flexbox-col flex-grow-1" ref={draggableRef}>
                <div className="flexbox-col dc__gap-8 flex-grow-1">
                    <UserPermissionListHeader
                        disabled={isActionsDisabled}
                        showStatus={showStatus}
                        handleSearch={handleSearch}
                        initialSearchText={searchKey}
                        getDataToExport={getUserDataForExport}
                    />
                    {showLoadingState || (totalCount && users.length) ? (
                        <UserPermissionTable
                            showStatus={showStatus}
                            isLoading={showLoadingState}
                            showPagination={showPagination}
                            isActionsDisabled={isActionsDisabled}
                            urlFilters={urlFilters}
                            users={users}
                            refetchUserPermissionList={refetchUserPermissionList}
                            totalCount={totalCount}
                        />
                    ) : (
                        <FiltersEmptyState clearFilters={clearFilters} />
                    )}
                    {isSomeRowChecked && selectedUsersCount > 0 && (
                        <BulkSelectionActionWidget
                            count={selectedUsersCount}
                            parentRef={draggableRef}
                            showStatus={showStatus}
                            areActionsDisabled={showLoadingState || isClearBulkSelectionModalOpen}
                            setBulkSelectionModalConfig={setBulkSelectionModalConfig}
                            refetchList={refetchUserPermissionList}
                            filterConfig={{
                                searchKey: urlFilters.searchKey,
                            }}
                            selectedIdentifiersCount={selectedUsersCount}
                            isCountApproximate={isBulkSelectionApplied}
                        />
                    )}
                </div>
            </div>

            {isClearBulkSelectionModalOpen && (
                <BulkSelectionModal
                    {...bulkSelectionModalConfig}
                    refetchList={refetchUserPermissionList}
                    urlFilters={urlFilters}
                    selectedIdentifiersCount={selectedUsersCount}
                    setBulkSelectionModalConfig={setBulkSelectionModalConfig}
                    entityType={BulkSelectionEntityTypes.users}
                />
            )}
        </>
    )
}

export default UserPermissionContainer
