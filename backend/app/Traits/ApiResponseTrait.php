<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

trait ApiResponseTrait
{
    /**
     * Send a standardized success JSON response.
     */
    public function sendResponse(mixed $data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        return response()->json($response, $code);
    }

    /**
     * Send a standardized error JSON response.
     *
     * @param  array<string, mixed>|null  $errors
     */
    public function sendError(string $message = 'An error occurred', ?array $errors = null, int $code = 400): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (! empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Send a standardized paginated JSON response.
     */
    public function sendPaginated(LengthAwarePaginator|ResourceCollection $paginator, string $message = 'Success', int $code = 200): JsonResponse
    {
        $paginationData = $paginator instanceof ResourceCollection
            ? $paginator->response()->getData(true)
            : [
                'data' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'from' => $paginator->firstItem(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'to' => $paginator->lastItem(),
                    'total' => $paginator->total(),
                ],
                'links' => [
                    'first' => $paginator->url(1),
                    'last' => $paginator->url($paginator->lastPage()),
                    'prev' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
            ];

        $response = [
            'success' => true,
            'message' => $message,
            'data' => $paginationData['data'] ?? [],
            'meta' => $paginationData['meta'] ?? [],
            'links' => $paginationData['links'] ?? [],
        ];

        return response()->json($response, $code);
    }
}
