package org.binaryheart.utils;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.mock;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import io.javalin.http.Context;
import org.binaryheart.exceptions.BadArgumentException;
import org.junit.jupiter.api.Test;

class QueryParamUtilTest {

	@Test
	void parsesBlankAndValidValues() throws Exception {
		Context context = mock(Context.class);
		expect(context.queryParam("text")).andReturn("  value  ");
		expect(context.queryParam("blank")).andReturn("  ");
		expect(context.queryParam("number")).andReturn(" 42 ");
		expect(context.queryParam("flag")).andReturn("true");
		replay(context);

		assertEquals("value", QueryParamUtil.stringParam(context, "text"));
		assertNull(QueryParamUtil.stringParam(context, "blank"));
		assertEquals(42, QueryParamUtil.intParam(context, "number"));
		assertEquals(true, QueryParamUtil.boolParam(context, "flag", false));
		verify(context);
	}

	@Test
	void rejectsMalformedIntegerAndTreatsOtherBooleansAsFalse() throws Exception {
		Context integer = queryContext("number", "many");
		Context bool = queryContext("flag", "sometimes");

		assertThrows(BadArgumentException.class, () -> QueryParamUtil.intParam(integer, "number"));
		assertEquals(false, QueryParamUtil.boolParam(bool, "flag", true));
		verify(integer, bool);
	}

	private Context queryContext(String name, String value) {
		Context context = mock(Context.class);
		expect(context.queryParam(name)).andReturn(value);
		replay(context);
		return context;
	}
}