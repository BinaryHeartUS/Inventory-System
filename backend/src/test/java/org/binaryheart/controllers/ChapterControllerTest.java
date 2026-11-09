package org.binaryheart.controllers;

import static org.easymock.EasyMock.*;

import io.javalin.http.Context;
import java.util.List;
import org.binaryheart.responses.ChapterSummary;
import org.binaryheart.services.ChapterService;
import org.junit.jupiter.api.Test;

class ChapterControllerTest {
	@Test
	void listsInventoryChapterDirectory() throws Exception {
		ChapterService service = mock(ChapterService.class);
		Context context = mock(Context.class);
		List<ChapterSummary> chapters = List.of(new ChapterSummary(1, "National"));
		expect(service.getAllChapters()).andReturn(chapters);
		expect(context.json(chapters)).andReturn(context);
		replay(service, context);
		new ChapterController(service).getChapters(context);
		verify(service, context);
	}
}
