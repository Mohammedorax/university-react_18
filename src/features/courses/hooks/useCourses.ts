import { useAppDispatch, useAppSelector } from '@/store';
import { useEffect } from 'react';
import {
  fetchCourses,
  setFilters,
  setPagination,
  selectCoursesForCurrentPage,
  selectCoursesStatus,
  selectCoursesError,
  selectCurrentPage,
  selectCurrentQuery,
  selectCurrentDepartment,
  selectTotalItems,
  selectIsCourseSelected,
} from '@/features/courses/slice/coursesSlice';

interface UseCoursesOptions {
  query?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export const useCourses = ({ query = '', department = 'all', page = 1, limit = 8 }: UseCoursesOptions = {}) => {
  const dispatch = useAppDispatch();

  // Selectors
  const courses = useAppSelector(selectCoursesForCurrentPage);
  const status = useAppSelector(selectCoursesStatus);
  const error = useAppSelector(selectCoursesError);
  const currentPage = useAppSelector(selectCurrentPage);
  const currentQuery = useAppSelector(selectCurrentQuery);
  const currentDepartment = useAppSelector(selectCurrentDepartment);
  const totalItems = useAppSelector(selectTotalItems);

  // Effects
  useEffect(() => {
    if (query !== currentQuery || department !== currentDepartment || page !== currentPage) {
      dispatch(setFilters({ query, department }));
      dispatch(fetchCourses({ query, department, page, limit }));
    }
  }, [query, department, page, limit, dispatch, currentQuery, currentDepartment, currentPage]);

  // Actions
  const refetch = () => {
    dispatch(fetchCourses({ query, department, page, limit }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPagination({ page: newPage, limit }));
  };

  const handleSelectCourse = (courseId: string) => {
    dispatch(setFilters({ query, department }));
  };

  return {
    data: { items: courses, total: totalItems },
    isLoading: status === 'loading',
    isRefetching: status === 'loading',
    error,
    refetch,
    courses,
    currentPage,
    totalItems,
    handlePageChange,
    handleSelectCourse,
  };

  const handlePageChange = (newPage: number) > {
    dispatch(setPagination({ page: newPage, limit }));
  };

  return {
    data: { items: courses, total: totalItems },
    isLoading: status === 'loading',
    isRefetching: status === 'loading',
    error,
    refetch,
    courses,
    currentPage,
    totalItems,
    handlePageChange,
  };
};