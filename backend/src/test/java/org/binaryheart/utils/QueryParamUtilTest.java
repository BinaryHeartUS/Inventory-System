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
	void stringParamTrimsValidValue() {
		Context context = queryContext("text", "  value  ");

		assertEquals("value", QueryParamUtil.stringParam(context, "text"));

		verify(context);
	}

	@Test
	void stringParamReturnsNullForBlankValue() {
		Context context = queryContext("text", "  ");

		assertNull(QueryParamUtil.stringParam(context, "text"));

		verify(context);
	}

	@Test
	void intParamParsesValidInteger() throws Exception {
		Context context = queryContext("number", " 42 ");

		assertEquals(42, QueryParamUtil.intParam(context, "number"));

		verify(context);
	}

	@Test
	void boolParamParsesTrue() {
		Context context = queryContext("flag", "true");

		assertEquals(true, QueryParamUtil.boolParam(context, "flag", false));

		verify(context);
	}

	@Test
	void intParamRejectsMalformedInteger() {
		Context context = queryContext("number", "many");

		assertThrows(BadArgumentException.class, () -> QueryParamUtil.intParam(context, "number"));

		verify(context);
	}

	@Test
	void boolParamTreatsOtherValuesAsFalse() {
		Context context = queryContext("flag", "sometimes");

		assertEquals(false, QueryParamUtil.boolParam(context, "flag", true));

		verify(context);
	}

	private Context queryContext(String name, String value) {
		Context context = mock(Context.class);
		expect(context.queryParam(name)).andReturn(value);
		replay(context);
		return context;
	}
}