import { useEffect, useRef, RefObject } from 'react';

interface GestureHandlers {
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onRotate?: (angleDelta: number, center: { x: number; y: number }) => void;
  onDoubleTap?: (point: { x: number; y: number }) => void;
  onDrag?: (delta: { x: number; y: number }) => void;
  onGestureEnd?: () => void;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export function useGestures(
  elementRef: RefObject<HTMLElement>,
  handlers: GestureHandlers
) {
  const gestureStateRef = useRef({
    initialDistance: 0,
    initialAngle: 0,
    lastTap: null as TouchPoint | null,
    isDragging: false,
    lastTouchPoint: null as { x: number; y: number } | null,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Calcular distância entre dois pontos
    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.hypot(dx, dy);
    };

    // Calcular ângulo entre dois pontos
    const getAngle = (touch1: Touch, touch2: Touch) => {
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      return Math.atan2(dy, dx) * 180 / Math.PI;
    };

    // Calcular centro entre dois pontos
    const getCenter = (touch1: Touch, touch2: Touch) => {
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touches = e.touches;
      const state = gestureStateRef.current;

      if (touches.length === 1) {
        // Um dedo: preparar para arrasto ou double tap
        const touch = touches[0];
        const now = Date.now();
        const point = { x: touch.clientX, y: touch.clientY, timestamp: now };

        // Verificar double tap (< 300ms entre toques)
        if (state.lastTap && now - state.lastTap.timestamp < 300) {
          const dx = Math.abs(point.x - state.lastTap.x);
          const dy = Math.abs(point.y - state.lastTap.y);
          
          // Se toques estão próximos (< 30px), é double tap
          if (dx < 30 && dy < 30 && handlers.onDoubleTap) {
            handlers.onDoubleTap(point);
            state.lastTap = null; // Reset para evitar triple tap
            return;
          }
        }

        state.lastTap = point;
        state.lastTouchPoint = { x: touch.clientX, y: touch.clientY };
        state.isDragging = false;

      } else if (touches.length === 2) {
        // Dois dedos: preparar para pinch ou rotação
        e.preventDefault(); // Prevenir zoom do navegador
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        state.initialDistance = getDistance(touch1, touch2);
        state.initialAngle = getAngle(touch1, touch2);
        state.isDragging = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touches = e.touches;
      const state = gestureStateRef.current;

      if (touches.length === 1 && handlers.onDrag && state.lastTouchPoint) {
        // Um dedo: arrasto
        const touch = touches[0];
        const delta = {
          x: touch.clientX - state.lastTouchPoint.x,
          y: touch.clientY - state.lastTouchPoint.y,
        };

        // Só considerar arrasto se movimento > 5px (evitar jitter)
        if (!state.isDragging && (Math.abs(delta.x) > 5 || Math.abs(delta.y) > 5)) {
          state.isDragging = true;
        }

        if (state.isDragging) {
          handlers.onDrag(delta);
        }

        state.lastTouchPoint = { x: touch.clientX, y: touch.clientY };

      } else if (touches.length === 2) {
        // Dois dedos: pinch e rotação
        e.preventDefault();
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        // Pinch (zoom)
        if (handlers.onPinch) {
          const currentDistance = getDistance(touch1, touch2);
          const scale = currentDistance / state.initialDistance;
          const center = getCenter(touch1, touch2);
          
          handlers.onPinch(scale, center);
        }

        // Rotação
        if (handlers.onRotate) {
          const currentAngle = getAngle(touch1, touch2);
          const angleDelta = currentAngle - state.initialAngle;
          
          handlers.onRotate(angleDelta);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const state = gestureStateRef.current;

      if (e.touches.length === 0) {
        // Todos os dedos levantados: reset
        state.isDragging = false;
        state.lastTouchPoint = null;
        
        // Avisar que o gesto terminou
        if (handlers.onGestureEnd) {
          handlers.onGestureEnd();
        }
      } else if (e.touches.length === 1) {
        // Voltou para um dedo: reset pinch/rotate
        state.initialDistance = 0;
        state.initialAngle = 0;
        
        // Avisar que o gesto terminou
        if (handlers.onGestureEnd) {
          handlers.onGestureEnd();
        }
      }
    };

    // Adicionar event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [elementRef, handlers]);
}
