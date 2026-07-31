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
	void parsePageSizeAcceptsValidValue() throws Exception {
		Context context = queryContext("pageSize", "100");

		assertEquals(100, PaginationUtil.parsePageSize(context));

		verify(context);
	}

	@Test
	void parsePageKeyDefaultsWhenMissing() throws Exception {
		Context context = queryContext("pageKey", null);

		assertEquals(0, PaginationUtil.parsePageKey(context));

		verify(context);
	}

	@Test
	void parsePageSizeRejectsMissingValue() {
		Context context = queryContext("pageSize", null);

		assertThrows(BadArgumentException.class, () -> PaginationUtil.parsePageSize(context));

		verify(context);
	}

	@Test
	void parsePageSizeRejectsZero() {
		Context context = queryContext("pageSize", "0");

		assertThrows(BadArgumentException.class, () -> PaginationUtil.parsePageSize(context));

		verify(context);
	}

	@Test
	void parsePageSizeRejectsValueAboveMaximum() {
		Context context = queryContext("pageSize", "1001");

		assertThrows(BadArgumentException.class, () -> PaginationUtil.parsePageSize(context));

		verify(context);
	}

	@Test
	void parsePageKeyRejectsNegativeValue() {
		Context context = queryContext("pageKey", "-1");

		assertThrows(BadArgumentException.class, () -> PaginationUtil.parsePageKey(context));

		verify(context);
	}

	private Context queryContext(String name, String value) {
		Context context = mock(Context.class);
		expect(context.queryParam(name)).andReturn(value);
		replay(context);
		return context;
	}
}