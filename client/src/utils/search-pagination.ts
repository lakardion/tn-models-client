import {
  useEffect,
  ChangeEvent,
  useCallback,
  useMemo,
  useState,
  Dispatch,
  SetStateAction,
} from 'react'
import { useQuery } from '@tanstack/react-query'

/**
 * Get handlers for pagination
 * @param setPage State setter for the pages.
 * @param maxPage the maximum page of the pagination
 * @returns
 */
export const usePaginationHandlers = (
  setPage: Dispatch<SetStateAction<number>>,
  maxPage: number,
) => {
  const next = useCallback(() => {
    setPage(p => {
      if (p === maxPage) return p

      return p + 1
    })
  }, [maxPage, setPage])
  const previous = useCallback(() => {
    setPage(p => {
      if (p === 1) return p
      return p - 1
    })
  }, [setPage])
  const first = useCallback(() => {
    setPage(1)
  }, [setPage])
  const last = useCallback(() => {
    setPage(maxPage)
  }, [maxPage, setPage])

  return useMemo(
    () => ({
      next,
      previous,
      first,
      last,
    }),
    [first, last, next, previous],
  )
}

/**
 * Use when you have a rapidly changing value that you want to wait a certain amount of time before you get a value from it
 * @param value
 */
export const useDebouncedValue = <T>(value: T, timeoutMs: number) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebounced(value)
    }, timeoutMs)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [timeoutMs, value])

  return debounced
}

type GenericPaginatedSearchRequest<T> = (search: string, page: number) => Promise<T>

/**
 *
 * @param resourceKey The key to identify the query in the query cache
 * @param searchRequest The function that executes the request based on search query and page
 * @param debounceTimeoutMS The timeout to debounce the query change
 * @returns
 */
export const usePaginatedDebouncedSearch = <T>(
  resourceKey: string,
  searchRequest: GenericPaginatedSearchRequest<T>,
  debounceTimeoutMS = 500,
) => {
  const [searchQuery, setSearchQuery] = useState<{
    search: string
    page: number
  }>({
    search: '',
    page: 1,
  })

  const debouncedSearch = useDebouncedValue(searchQuery.search, debounceTimeoutMS)

  const { data: searchResult, isLoading, isPreviousData, isFetching } = useQuery<T>(
    [resourceKey, debouncedSearch, searchQuery.page],
    () => searchRequest(debouncedSearch, searchQuery.page),
    {
      enabled: Boolean(searchQuery.search),
      keepPreviousData: true,
      retry: 1,
    },
  )

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery({ search: e.target.value, page: 1 })
  }, [])

  const setPage = useCallback((args: Parameters<Dispatch<SetStateAction<number>>>[0]) => {
    if (typeof args === 'function') {
      setSearchQuery(sq => ({
        ...sq,
        page: args(sq.page),
      }))
    } else
      setSearchQuery(sq => ({
        ...sq,
        page: args,
      }))
  }, [])

  return useMemo(
    () => ({
      search: searchQuery.search,
      debouncedSearch: debouncedSearch,
      page: searchQuery.page,
      handleSearchChange,
      setPage,
      searchResult,
      isLoading: isLoading || isFetching,
      isPreviousData,
    }),
    [
      searchQuery.search,
      searchQuery.page,
      debouncedSearch,
      handleSearchChange,
      setPage,
      searchResult,
      isLoading,
      isFetching,
      isPreviousData,
    ],
  )
}

type PaginatedRequest<T> = (page: number) => Promise<T>

/**
 * Simple hook that wraps around react query and sets up pagination.
 * @param paginatedRequest function that accepts a page and internally calls the api with that page
 * @param resourceName the key to use as query key to identify the resource in the query cache
 * @returns
 */
export const usePaginatedRequest = <T>(
  paginatedRequest: PaginatedRequest<T>,
  resourceName: string,
) => {
  const [page, setPage] = useState(1)
  const { data, isLoading, isPreviousData } = useQuery(
    [resourceName, page],
    () => {
      return paginatedRequest(page)
    },
    { keepPreviousData: true },
  )

  return useMemo(
    () => ({
      data,
      isLoading,
      page,
      isPreviousData,
      setPage,
    }),
    [data, isLoading, page, isPreviousData],
  )
}
