package org.binaryheart.services;

public class HealthService {

	public String health() {
		return "OK";
	}

	public String ping() {
		System.out.println("Ping received from frontend!");
		return "pong";
	}
}
