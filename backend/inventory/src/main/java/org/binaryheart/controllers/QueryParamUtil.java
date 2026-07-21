package org.binaryheart.controllers;

import io.javalin.http.Context;
import org.binaryheart.exceptions.BadArgumentException;


public final class QueryParamUtil {

	private QueryParamUtil() {}

	/**
	 * Returns a trimmed query parameter value, or {@code null} when absent/blank.
	 */
	public static String stringParam(Context ctx, String name) {
		String raw = ctx.queryParam(name);
		if (raw == null || raw.isBlank()) {
			return null;
		}
		return raw.trim();
	}

	/** 
     * Parses an optional integer query parameter; {@code null} when absent.
     */
	public static Integer intParam(Context ctx, String name) throws BadArgumentException {
		String raw = ctx.queryParam(name);
		if (raw == null || raw.isBlank()) {
			return null;
		}
		try {
			return Integer.parseInt(raw.trim());
		} catch (NumberFormatException e) {
			throw new BadArgumentException(name + " must be an integer: " + raw);
		}
	}

	/**
	 * Parses an optional boolean query parameter, defaulting to
	 * {@code defaultValue} when absent.
	 */
	public static boolean boolParam(Context ctx, String name, boolean defaultValue) {
		String raw = ctx.queryParam(name);
		if (raw == null || raw.isBlank()) {
			return defaultValue;
		}
		return Boolean.parseBoolean(raw.trim());
	}
}
