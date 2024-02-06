import {
    BulkSelection,
    BulkSelectionEvents,
    Pagination,
    SELECT_ALL_ACROSS_PAGES_LOCATOR,
    SortableTableHeaderCell,
    useBulkSelection,
} from '@devtron-labs/devtron-fe-common-lib'
import React from 'react'
import { toast } from 'react-toastify'
import { importComponentFromFELibrary } from '../../../../../components/common'
import { User } from '../../types'
import { SortableKeys, userListLoading } from './constants'
import { UserPermissionTableProps } from './types'
import UserPermissionRow from './UserPermissionRow'

const StatusHeaderCell = importComponentFromFELibrary('StatusHeaderCell', null, 'function')

const UserPermissionTable = ({
    showStatus,
    isLoading,
    showPagination,
    isActionsDisabled,
    urlFilters,
    users,
    refetchUserPermissionList,
    totalCount,
}: UserPermissionTableProps) => {
    const { sortBy, sortOrder, handleSorting, offset, pageSize, changePage, changePageSize } = urlFilters

    const { handleBulkSelection, selectedIdentifiers: bulkSelectionState } =
        useBulkSelection<Record<User['id'], boolean>>()
    const isSomeRowChecked = Object.values(bulkSelectionState).some(Boolean)
    const isBulkSelectionApplied = bulkSelectionState[SELECT_ALL_ACROSS_PAGES_LOCATOR]

    const sortByEmail = () => {
        handleSorting(SortableKeys.email)
    }

    const sortByLastLogin = () => {
        handleSorting(SortableKeys.lastLogin)
    }

    const toggleCheckForBulkSelection = (id: User['id']) => {
        if (isBulkSelectionApplied) {
            handleBulkSelection({
                action: BulkSelectionEvents.CLEAR_IDENTIFIERS_AFTER_ACROSS_SELECTION,
                data: {
                    identifierIds: [id],
                },
            })
            toast.info('All previous selections have been cleared')
            return
        }

        handleBulkSelection(
            bulkSelectionState[id]
                ? {
                      action: BulkSelectionEvents.CLEAR_IDENTIFIERS,
                      data: {
                          identifierIds: [id],
                      },
                  }
                : {
                      action: BulkSelectionEvents.SELECT_IDENTIFIER,
                      data: {
                          identifierObject: {
                              ...bulkSelectionState,
                              [id]: true,
                          },
                      },
                  },
        )
    }

    return (
        <div className="flexbox-col flex-grow-1 show-shimmer-loading">
            <div
                className={`user-permission__header ${
                    showStatus ? 'user-permission__header--with-status' : ''
                } cn-7 fs-12 fw-6 lh-20 dc__uppercase pl-20 pr-20 dc__border-bottom dc__position-sticky dc__top-0 bcn-0 dc__zi-1`}
            >
                {isLoading ? (
                    <span className="child child-shimmer-loading" />
                ) : (
                    <BulkSelection showPagination={showPagination} />
                )}
                <SortableTableHeaderCell
                    title="Email"
                    triggerSorting={sortByEmail}
                    isSorted={sortBy === SortableKeys.email}
                    sortOrder={sortOrder}
                    disabled={isActionsDisabled}
                />
                <SortableTableHeaderCell
                    title="Last Login"
                    triggerSorting={sortByLastLogin}
                    isSorted={sortBy === SortableKeys.lastLogin}
                    sortOrder={sortOrder}
                    disabled={isActionsDisabled}
                />
                {showStatus && <StatusHeaderCell />}
                <span />
            </div>
            {isLoading ? (
                userListLoading.map((user) => (
                    <div
                        className={`user-permission__row ${
                            showStatus ? 'user-permission__row--with-status' : ''
                        } pl-20 pr-20`}
                        key={`user-list-${user.id}`}
                    >
                        <span className="child child-shimmer-loading" />
                        <span className="child child-shimmer-loading" />
                        <span className="child child-shimmer-loading" />
                        {showStatus && <span className="child child-shimmer-loading" />}
                    </div>
                ))
            ) : (
                <>
                    <div className="fs-13 fw-4 lh-20 cn-9 flex-grow-1" id="user-permissions-list">
                        {users.map((user, index) => (
                            <UserPermissionRow
                                {...user}
                                index={index}
                                key={`user-${user.id}`}
                                showStatus={showStatus}
                                refetchUserPermissionList={refetchUserPermissionList}
                                isChecked={isBulkSelectionApplied || bulkSelectionState[user.id]}
                                toggleChecked={toggleCheckForBulkSelection}
                                showCheckbox={isSomeRowChecked}
                            />
                        ))}
                    </div>
                    {showPagination && (
                        <Pagination
                            rootClassName="flex dc__content-space pl-20 pr-20 dc__border-top"
                            size={totalCount}
                            offset={offset}
                            pageSize={pageSize}
                            changePage={changePage}
                            changePageSize={changePageSize}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default UserPermissionTable
