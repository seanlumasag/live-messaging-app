package com.livemessaging.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.livemessaging.backend.security.WebSocketAuthChannelInterceptor;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthChannelInterceptor authChannelInterceptor;
    private final String[] allowedOrigins;

    public WebSocketConfig(WebSocketAuthChannelInterceptor authChannelInterceptor,
                           @Value("${app.cors.allowed-origins:http://localhost:5173}") String allowedOrigins) {
        this.authChannelInterceptor = authChannelInterceptor;
        this.allowedOrigins = allowedOrigins.split("\\s*,\\s*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(authChannelInterceptor);
    }
}
