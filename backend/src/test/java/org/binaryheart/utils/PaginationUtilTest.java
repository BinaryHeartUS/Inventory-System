package org.binaryheart.utils;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.javalin.http.Context;
import org.binaryheart.exceptions.BadArgumentException;
import org.junit.jupiter.api.Test;

class PaginationUtilTest {

	@Test
	void acceptsValidValuesAndDefaultsPageKey() throws Exception {
		Context context = mock(Context.class);
		expect(context.queryParam("pageSize")).andReturn("100");
		expect(context.queryParam("pageKey")).andReturn(null);
		replay(context);

		assertEquals(100, PaginationUtil.parsePageSize(context));
		assertEquals(0, PaginationUtil.parsePageKey(context));
		verify(context);
	}

	@Test
	void rejectsMissingOutOfRangeAndNegativeValues() {
		Context missing = queryContext("pageSize", null);
		Context zero = queryContext("pageSize", "0");
		Context tooLarge = queryContext("pageSize", "1001");
		Context negativePage = queryContext("pageKey", "-1");

		assertThrows(BadArgumentException.class, () -> PaginationUtil.parsePageSize(missing));
		assertThrows(BadArgumentException.class, () -> PaginationUtil.parsePageSize(zero));
		assertThrows(BadArgumentException.class, () -> PaginationUtil.parsePageSize(tooLarge));
		assertThrows(BadArgumentException.class, () -> PaginationUtil.parsePageKey(negativePage));
		verify(missing, zero, tooLarge, negativePage);
	}

	private Context queryContext(String name, String value) {
		Context context = mock(Context.class);
		expect(context.queryParam(name)).andReturn(value);
		replay(context);
		return context;
	}
}