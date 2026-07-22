package org.binaryheart.controllers;

import io.javalin.http.Context;
import org.binaryheart.exceptions.BadArgumentException;

public final class PaginationUtil {

	private static final int MAX_PAGE_SIZE = 1000;

	private PaginationUtil() {
	}

	public static int parsePageSize(Context ctx) throws BadArgumentException {
		Integer pageSize = QueryParamUtil.intParam(ctx, "pageSize");
		if (pageSize == null) {
			throw new BadArgumentException("pageSize is required");
		}
		if (pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
			throw new BadArgumentException("pageSize must be between 1 and " + MAX_PAGE_SIZE);
		}
		return pageSize;
	}

	public static int parsePageKey(Context ctx) throws BadArgumentException {
		Integer pageKey = QueryParamUtil.intParam(ctx, "pageKey");
		if (pageKey == null) {
			return 0;
		}
		if (pageKey < 0) {
			throw new BadArgumentException("pageKey must be zero or greater");
		}
		return pageKey;
	}
}
