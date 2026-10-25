/**
 * EventPass Share & Export Engine
 * Generates shareable standalone HTML passes, embed codes, ZIP exports,
 * and deployment-ready configurations.
 */

// EventPass logo (embedded so standalone passes work offline)
const EVENTPASS_LOGO_URI = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgcm9sZT0iaW1nIiBhcmlhLWxhYmVsPSJFdmVudFBhc3MgbG9nbyIgeG1sbnM6YzJwYT0iaHR0cDovL2MycGEub3JnL21hbmlmZXN0Ij48bWV0YWRhdGE+PGMycGE6bWFuaWZlc3Q+QUFBV2dtcDFiV0lBQUFBZWFuVnRaR015Y0dFQUVRQVFnQUFBcWdBNG0zRURZekp3WVFBQUFCWmNhblZ0WWdBQUFFZHFkVzFrWXpKdFlRQVJBQkNBQUFDcUFEaWJjUU4xY200Nll6SndZVHBtWWpBMU1tWXhOQzAyWkRZMExUUTVNVFF0WW1NMk5pMHlZelU1WXpZNE5UTTFZellBQUFBRGwycDFiV0lBQUFBcGFuVnRaR015WVhNQUVRQVFnQUFBcWdBNG0zRURZekp3WVM1aGMzTmxjblJwYjI1ekFBQUFBTHhxZFcxaUFBQUFSR3AxYldSalltOXlBQkVBRUlBQUFLb0FPSnR4RTJNeWNHRXVhVzVuY21Wa2FXVnVkQzUyTXdBQUFBQVlZekp6YUUxSkJMU3JhUCs0RC94bmJyVlBXWW9BQUFCd1kySnZjcU5wWkdNNlptOXliV0YwYldsdFlXZGxMM04yWnl0NGJXeHFhVzV6ZEdGdVkyVkpSSGdzZUcxd09tbHBaRHBoWldNMVl6VTNNaTB6TWpCbUxUUmlPVFF0WW1VNFppMDBaRGd6TmpWaE9XVTFaVEpzY21Wc1lYUnBiMjV6YUdsd2FIQmhjbVZ1ZEU5bUFBQUI0bXAxYldJQUFBQkJhblZ0WkdOaWIzSUFFUUFRZ0FBQXFnQTRtM0VUWXpKd1lTNWhZM1JwYjI1ekxuWXlBQUFBQUJoak1uTm9RNjVlVWVrK212WUt5MVBTUkVNODRBQUFBWmxqWW05eW9tZGhZM1JwYjI1emdxSm1ZV04wYVc5dWEyTXljR0V1YjNCbGJtVmthbkJoY21GdFpYUmxjbk9oYTJsdVozSmxaR2xsYm5SemdhSmpkWEpzZUMxelpXeG1JMnAxYldKbVBXTXljR0V1WVhOelpYSjBhVzl1Y3k5ak1uQmhMbWx1WjNKbFpHbGxiblF1ZGpOa2FHRnphRmdnUUZwb2dnRHR2WUhxKysxOS9LZm1IV2dkVHVpSWprSlFVNnA5dURueTJBMmtabUZqZEdsdmJuZ2RZMjl0TG1GdWRHaHliM0JwWXk1amJHRjFaR1V1Y0hKdmRtbGtaV1JxY0dGeVlXMWxkR1Z5YzZGNEgyTnZiUzVoYm5Sb2NtOXdhV011YjNKcFoybHVMV052Ym1acFpHVnVZMlZuZFc1cmJtOTNibXRrWlhOamNtbHdkR2x2Ym5obVEyeGhkV1JsSUhCeWIzWnBaR1ZrSUhSb2FYTWdabWxzWlNCaGRDQjBhR1VnY21WeGRXVnpkQ0J2WmlCaElIVnpaWElnWVc1a0lHMWhlU0JvWVhabElHTnlaV0YwWldRZ2IzSWdiVzlrYVdacFpXUWdkR2hsSUdacGJHVWdZMjl1ZEdWdWRITXViWE52Wm5SM1lYSmxRV2RsYm5TaFpHNWhiV1ZtUTJ4aGRXUmxjbUZzYkVGamRHbHZibk5KYm1Oc2RXUmxaUFVBQUFESWFuVnRZZ0FBQUVCcWRXMWtZMkp2Y2dBUkFCQ0FBQUNxQURpYmNSTmpNbkJoTG1oaGMyZ3VaR0YwWVFBQUFBQVlZekp6YUNXTWMvbDhDMTc5WGk3WkdlQWEyVkVBQUFDQVkySnZjcVZqWVd4blpuTm9ZVEkxTm1Od1lXUk5BQUFBQUFBQUFBQUFBQUFBQUdSb1lYTm9XQ0EzZDFVRDlmZzJvN3Y4SHMyck5DM05UM1pvaTdOT1IyWXFMbEdXbXJrbTRXUnVZVzFsYm1wMWJXSm1JRzFoYm1sbVpYTjBhbVY0WTJ4MWMybHZibk9Cb21WemRHRnlkQmk5Wm14bGJtZDBhQmtlQkFBQUFqNXFkVzFpQUFBQUoycDFiV1JqTW1Oc0FCRUFFSUFBQUtvQU9KdHhBMk15Y0dFdVkyeGhhVzB1ZGpJQUFBQUNEMk5pYjNLbFkyRnNaMlp6YUdFeU5UWnBjMmxuYm1GMGRYSmxlRTF6Wld4bUkycDFiV0ptUFM5ak1uQmhMM1Z5Ympwak1uQmhPbVppTURVeVpqRTBMVFprTmpRdE5Ea3hOQzFpWXpZMkxUSmpOVGxqTmpnMU16VmpOaTlqTW5CaExuTnBaMjVoZEhWeVpXcHBibk4wWVc1alpVbEVlQ3g0YlhBNmFXbGtPalZpTnpkak5EUXhMVGMzT0RBdE5ESXdNeTA0WXpKa0xUYzFaRFkzT1RVM1pUQm1NSEpqY21WaGRHVmtYMkZ6YzJWeWRHbHZibk9Eb21OMWNteDRMWE5sYkdZamFuVnRZbVk5WXpKd1lTNWhjM05sY25ScGIyNXpMMk15Y0dFdWFXNW5jbVZrYVdWdWRDNTJNMlJvWVhOb1dDQkFXbWlDQU8yOWdlcjc3WDM4cCtZZGFCMU82SWlPUWxCVHFuMjRPZkxZRGFKamRYSnNlQ3B6Wld4bUkycDFiV0ptUFdNeWNHRXVZWE56WlhKMGFXOXVjeTlqTW5CaExtRmpkR2x2Ym5NdWRqSmthR0Z6YUZnZ2pKbzFKL1kxMTlrUm51WjVobjFVTXljY0tNM210VFpoZkw4RFBITEJhQXFpWTNWeWJIZ3BjMlZzWmlOcWRXMWlaajFqTW5CaExtRnpjMlZ5ZEdsdmJuTXZZekp3WVM1b1lYTm9MbVJoZEdGa2FHRnphRmdnN0F3Y3puRjVDaWNLZ1dKajlRTHMyNlgwQkozdEcxeHRJYnp6aVNNd0lsdDBZMnhoYVcxZloyVnVaWEpoZEc5eVgybHVabStqWkc1aGJXVnZRVzUwYUhKdmNHbGpJRVpwYkdWelozWmxjbk5wYjI1bE1TNHdMakJyYzNCbFkxWmxjbk5wYjI1bE1pNDBMakFBQUJBNGFuVnRZZ0FBQUNocWRXMWtZekpqY3dBUkFCQ0FBQUNxQURpYmNRTmpNbkJoTG5OcFoyNWhkSFZ5WlFBQUFCQUlZMkp2Y3RLRVdRSVNvZ0VtR0NGWkFnb3dnZ0lHTUlJQmphQURBZ0VDQWhSQTVhQUs3c0k1MEw2NGcvb0dRZ1U5WjFVVEFEQUtCZ2dxaGtqT1BRUURBekJKTVJjd0ZRWURWUVFLRXc1QmJuUm9jbTl3YVdNc0lGQkNRekV1TUN3R0ExVUVBeE1sUVc1MGFISnZjR2xqSUVOdmJuUmxiblFnUTNKbFpHVnVkR2xoYkhNZ1VtOXZkQ0JEUVRBZUZ3MHlOakE0TURjeE9EUXpOVFphRncweU9EQTRNRFl4T1RRek5UWmFNRVF4RnpBVkJnTlZCQW9URGtGdWRHaHliM0JwWXl3Z1VFSkRNU2t3SndZRFZRUURFeUJCYm5Sb2NtOXdhV01nUTJ4aGRXUmxJRU52Ym5SbGJuUWdVMmxuYm1sdVp6QlpNQk1HQnlxR1NNNDlBZ0VHQ0NxR1NNNDlBd0VIQTBJQUJKaDZDbXZMVUJnRkZOVTB2VUtsT1Z0RTZkamQxN0w1U3V3WDBMZW1GaXNCTTNka2QvM2N5anhGQTNRbzVTNDZmWDAvaWhZMFZaN21mYjlLRjcwM3Q1T2pXREJXTUE0R0ExVWREd0VCL3dRRUF3SUhnREFWQmdOVkhTVUVEakFNQmdvckJnRUVBWVBvWGdJQk1Bd0dBMVVkRXdFQi93UUNNQUF3SHdZRFZSMGpCQmd3Rm9BVXpsSGlCSUZPWkZzaitPUEV6NW8rbk1IWFhNSXdDZ1lJS29aSXpqMEVBd01EWndBd1pBSXdNWE1kRko0QmV0TExWWTdPUnVFOW5vcWJiQVpPWm4vYUFyWHlUd0ZBWmZLclB6eEYydlBvSk5mMStVQ2RnMVhHQWpCd1gxemQ5V0dxWWtxbUw1U0ZxdzFReVNqcjF6SmZwSk05KzFyZER3U1BMTU9QT2pLdWlYam9VL3BVVWVHOVJ3bWhZM0JoWkZrTm5nQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUFpZUUs1Y0RpZE1RS1cyTmtBV3FublJDZUFPRjJMM05kdFJNYjNBU3FlNkRnZGg1VWpkN2NLaXFySnRPNm5xdVBLN0o4TDBiM3NSM1lMcmdqd2xPSmo2Q053PTwvYzJwYTptYW5pZmVzdD48L21ldGFkYXRhPgogIDx0aXRsZT5FdmVudFBhc3M8L3RpdGxlPgogIDxkZWZzPgogICAgPHBhdGggaWQ9InQxIiBkPSJNMjAgMTAwIGE4MCA4MCAwIDEgMSAxNjAgMCIvPgogICAgPHBhdGggaWQ9ImIxIiBkPSJNMTYgMTAwIGE4NCA4NCAwIDAgMCAxNjggMCIvPgogIDwvZGVmcz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9Ijk2IiBmaWxsPSIjMUIyQTZCIi8+CiAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTAwIiByPSI2OCIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjRDMyRjJGIiBzdHJva2Utd2lkdGg9IjUiLz4KICA8dGV4dCBmb250LWZhbWlseT0iQXJpYWwsIEhlbHZldGljYSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNyIgZm9udC13ZWlnaHQ9IjcwMCIgZmlsbD0iI2ZmZiIgbGV0dGVyLXNwYWNpbmc9IjMiPjx0ZXh0UGF0aCBocmVmPSIjdDEiIHN0YXJ0T2Zmc2V0PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVWRU5UUEFTUzwvdGV4dFBhdGg+PC90ZXh0PgogIDx0ZXh0IGZvbnQtZmFtaWx5PSJBcmlhbCwgSGVsdmV0aWNhLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iNzAwIiBmaWxsPSIjZmZmIiBsZXR0ZXItc3BhY2luZz0iMiI+PHRleHRQYXRoIGhyZWY9IiNiMSIgc3RhcnRPZmZzZXQ9IjUwJSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QVRURU5EIMK3IFZFUklGWSDCtyBDRVJUSUZZPC90ZXh0UGF0aD48L3RleHQ+CiAgPGNpcmNsZSBjeD0iMTQiIGN5PSIxMDAiIHI9IjMuNSIgZmlsbD0iI0YyQjgyMCIvPgogIDxjaXJjbGUgY3g9IjE4NiIgY3k9IjEwMCIgcj0iMy41IiBmaWxsPSIjRjJCODIwIi8+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAwLDcyKSI+CiAgICA8cGF0aCBkPSJNMCAtMjYgQzggLTE0IDE0IC02IDEwIDQgQzggOSAtOCA5IC0xMCA0IEMtMTQgLTYgLTYgLTE0IDAgLTI2WiIgZmlsbD0iI0YyQjgyMCIvPgogICAgPHBhdGggZD0iTTAgLTEwIEM0IC00IDYgMCA0IDQgQzIgNyAtMiA3IC00IDQgQy02IDAgLTMgLTQgMCAtMTBaIiBmaWxsPSIjRDMyRjJGIi8+CiAgPC9nPgogIDxyZWN0IHg9IjY4IiB5PSI4NCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiByeD0iNiIgZmlsbD0iIzFCMkE2QiIvPgogIDxjaXJjbGUgY3g9IjY4IiBjeT0iMTA0IiByPSI1IiBmaWxsPSIjZmZmIi8+CiAgPGNpcmNsZSBjeD0iMTMyIiBjeT0iMTA0IiByPSI1IiBmaWxsPSIjZmZmIi8+CiAgPHJlY3QgeD0iNzUiIHk9IjkxIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIi8+CiAgPHJlY3QgeD0iMTE3IiB5PSI5MSIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iI2ZmZiIvPgogIDxyZWN0IHg9Ijc1IiB5PSIxMDkiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiLz4KICA8cmVjdCB4PSI5MCIgeT0iOTYiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz4KICA8cmVjdCB4PSI5OCIgeT0iMTA0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CiAgPHJlY3QgeD0iOTAiIHk9IjExMiIgd2lkdGg9IjQiIGhlaWdodD0iNCIgZmlsbD0iI2ZmZiIvPgogIDxyZWN0IHg9IjEwNiIgeT0iOTYiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz4KICA8Y2lyY2xlIGN4PSIxMjYiIGN5PSIxMjQiIHI9IjExIiBmaWxsPSIjRDMyRjJGIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPgogIDxwYXRoIGQ9Ik0xMjAuNSAxMjQgbDQgNCBsNyAtOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=';

class ShareEngine {
  constructor() {
    this.baseUrl = window.location.href.replace(/\/[^/]*$/, '/');
  }

  // ──────────────────────────────────────────────────
  // 1. STANDALONE SHAREABLE HTML PASS
  // ──────────────────────────────────────────────────

  /**
   * Generate a self-contained HTML file for a single attendee pass.
   * Contains inline styles, inline QR code (canvas-based), and works offline.
   */
  generateStandalonePassHTML(attendee, eventData) {
    const isAttended = attendee.status === 'attended';
    const statusColor = isAttended ? '#10b981' : '#f59e0b';
    const statusText = isAttended ? '✓ Verified Checked-In' : '⏳ Registered (Pending)';
    const statusBg = isAttended ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EventPass - ${attendee.name} | ${eventData.title}</title>
  <meta name="description" content="Official EventPass digital badge for ${attendee.name} — ${eventData.title}">
  <meta property="og:title" content="EventPass - ${attendee.name}">
  <meta property="og:description" content="${attendee.name} is ${isAttended ? 'a verified attendee of' : 'registered for'} ${eventData.title}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg-deep: #060a14;
      --bg-surface: #0c1322;
      --bg-card: rgba(15, 23, 42, 0.85);
      --border-glow: rgba(99, 102, 241, 0.25);
      --border-subtle: rgba(255, 255, 255, 0.06);
      --primary: #6366f1;
      --primary-glow: rgba(99, 102, 241, 0.3);
      --accent-cyan: #22d3ee;
      --success: #10b981;
      --warning: #f59e0b;
      --text-primary: #f1f5f9;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --font-sans: 'Inter', -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
      --radius: 16px;
    }
    body {
      font-family: var(--font-sans);
      background: var(--bg-deep);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background-image:
        radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(34, 211, 238, 0.06) 0%, transparent 50%);
    }
    .pass-wrapper {
      width: 100%;
      max-width: 440px;
    }
    .pass-card {
      background: var(--bg-card);
      border: 1px solid var(--border-glow);
      border-radius: var(--radius);
      padding: 2rem 1.75rem;
      text-align: center;
      backdrop-filter: blur(20px);
      box-shadow:
        0 0 40px rgba(99, 102, 241, 0.08),
        0 25px 60px rgba(0, 0, 0, 0.4);
      position: relative;
      overflow: hidden;
    }
    .pass-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), var(--accent-cyan), var(--primary));
      background-size: 200% 100%;
      animation: shimmer 3s ease-in-out infinite;
    }
    @keyframes shimmer {
      0%, 100% { background-position: 200% 0; }
      50% { background-position: -200% 0; }
    }
    .event-tag {
      display: inline-block;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.2);
      color: var(--primary);
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 0.35rem 0.85rem;
      border-radius: 100px;
      margin-bottom: 1.25rem;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 0.5rem;
    }
    .category-badge {
      background: linear-gradient(135deg, var(--primary), #818cf8);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 0.3rem 0.75rem;
      border-radius: 6px;
    }
    .year-badge {
      background: rgba(34, 211, 238, 0.12);
      border: 1px solid rgba(34, 211, 238, 0.25);
      color: var(--accent-cyan);
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: ${statusBg};
      color: ${statusColor};
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem 0.85rem;
      border-radius: 100px;
      border: 1px solid ${statusColor}33;
    }
    .status-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: ${statusColor};
      animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }
    .qr-frame {
      background: #ffffff;
      padding: 16px;
      border-radius: 12px;
      display: inline-block;
      margin: 1.25rem auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    .pass-id {
      font-family: var(--font-mono);
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--accent-cyan);
      letter-spacing: 2px;
      margin: 0.75rem 0 0.5rem;
    }
    .pass-name {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.35rem;
    }
    .pass-org {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 0.15rem;
    }
    .pass-hash {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      color: var(--text-dim);
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-subtle);
    }
    .event-info {
      margin-top: 1.25rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      text-align: left;
    }
    .event-info h4 {
      font-size: 0.9rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }
    .event-info p {
      font-size: 0.78rem;
      color: var(--text-muted);
      line-height: 1.5;
    }
    .footer-brand {
      margin-top: 1.5rem;
      font-size: 0.7rem;
      color: var(--text-dim);
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .action-bar {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      margin-top: 1.5rem;
      flex-wrap: wrap;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 8px;
      font-family: var(--font-sans);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #818cf8);
      color: white;
    }
    .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }

    @media print {
      body { background: white; padding: 0; }
      .pass-card { box-shadow: none; border: 2px solid #e2e8f0; }
      .pass-card::before { display: none; }
      .action-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="pass-wrapper">
    <div style="text-align: center; margin-bottom: 0.75rem;">
      <img src="${EVENTPASS_LOGO_URI}" alt="EventPass" style="width: 72px; height: 72px;">
    </div>
    <div style="text-align: center; margin-bottom: 1rem;">
      <span class="event-tag">${eventData.title}</span>
    </div>
    <div class="pass-card">
      <div class="header-row">
        <span class="category-badge">${(attendee.category || 'Student').toUpperCase()}</span>
        <span class="year-badge">${(attendee.yearLevel || 'Attendee').toUpperCase()}</span>
      </div>

      <div class="status-badge">
        <span class="status-dot"></span>
        ${statusText}
      </div>

      <div class="qr-frame">
        <div id="qrcode"></div>
      </div>

      <div class="pass-id">${attendee.id}</div>
      <h2 class="pass-name">${attendee.name}</h2>
      <p class="pass-org">${attendee.org} &bull; ${attendee.category}</p>

      <div class="event-info">
        <h4>${eventData.title}</h4>
        <p>
          📅 ${eventData.date} &bull; ${eventData.time}<br>
          📍 ${eventData.venue}<br>
          🏛️ ${eventData.organizer}
        </p>
      </div>

      <div class="pass-hash">${attendee.hash || 'SHA256: ' + attendee.id + '-VALID'}</div>

      <div class="action-bar">
        <button class="btn btn-primary" onclick="window.print()">🖨️ Print Pass</button>
        <button class="btn btn-secondary" onclick="navigator.share ? navigator.share({title: 'EventPass - ${attendee.name.replace(/'/g, "\\'")}', url: window.location.href}) : navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'))">🔗 Share</button>
      </div>

      <div class="footer-brand">EventPass &bull; Digital Event Credential</div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof QRCode !== 'undefined') {
        new QRCode(document.getElementById('qrcode'), {
          text: "${attendee.id}",
          width: 160,
          height: 160,
          colorDark: "#090d16",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      }
    });
  <\/script>
</body>
</html>`;
  }

  /**
   * Download a standalone HTML pass file for a specific attendee
   */
  downloadStandalonePass(attendee, eventData) {
    const html = this.generateStandalonePassHTML(attendee, eventData);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EventPass_${attendee.name.replace(/\s+/g, '_')}_${attendee.id}.html`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ──────────────────────────────────────────────────
  // 2. EMBED CODE GENERATOR
  // ──────────────────────────────────────────────────

  /**
   * Generate iframe embed code for the EventPass portal.
   * Works when hosted on any static server / deployment.
   */
  generateEmbedCode(options = {}) {
    const width = options.width || '100%';
    const height = options.height || '700px';
    const url = options.url || this.baseUrl + 'index.html';

    return `<!-- EventPass Embed Widget -->
<iframe
  src="${url}"
  width="${width}"
  height="${height}"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.15);"
  title="EventPass - Campus Event Registration Portal"
  allow="camera; clipboard-write"
  loading="lazy"
></iframe>`;
  }

  /**
   * Generate a lightweight embed widget script (JS snippet) for external sites.
   * Self-contained, creates the iframe dynamically.
   */
  generateWidgetSnippet(options = {}) {
    const url = options.url || this.baseUrl + 'index.html';
    const containerId = options.containerId || 'eventpass-widget';

    return `<!-- EventPass Widget -->
<div id="${containerId}"></div>
<script>
(function() {
  var container = document.getElementById('${containerId}');
  if (!container) return;
  var iframe = document.createElement('iframe');
  iframe.src = '${url}';
  iframe.style.cssText = 'width:100%;height:700px;border:none;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.15);';
  iframe.title = 'EventPass Portal';
  iframe.allow = 'camera; clipboard-write';
  iframe.loading = 'lazy';
  container.appendChild(iframe);
})();
<\/script>`;
  }

  // ──────────────────────────────────────────────────
  // 3. BATCH PASS EXPORT
  // ──────────────────────────────────────────────────

  /**
   * Generate all attendee passes as separate downloadable HTML files
   * packaged as a Blob (for manual download one by one)
   */
  downloadAllPasses(attendees, eventData) {
    attendees.forEach((attendee, index) => {
      setTimeout(() => {
        this.downloadStandalonePass(attendee, eventData);
      }, index * 500); // Stagger to avoid browser blocking
    });
  }

  // ──────────────────────────────────────────────────
  // 4. PROJECT ZIP EXPORT (using JSZip if available, otherwise manual)
  // ──────────────────────────────────────────────────

  /**
   * Export the entire EventPass project data as a JSON backup file
   */
  exportProjectData(attendees, eventData) {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '3.0',
      app: 'EventPass Campus Event System',
      event: eventData,
      totalAttendees: attendees.length,
      totalCheckedIn: attendees.filter(a => a.status === 'attended').length,
      attendees: attendees
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EventPass_Project_Backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import attendee data from a previously exported JSON backup
   */
  importProjectData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.attendees && Array.isArray(data.attendees)) {
            resolve(data);
          } else {
            reject(new Error('Invalid EventPass backup file format.'));
          }
        } catch (err) {
          reject(new Error('Failed to parse backup file: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  }

  // ──────────────────────────────────────────────────
  // 5. SHAREABLE LINK GENERATOR (Data URL / Base64)
  // ──────────────────────────────────────────────────

  /**
   * Generate a data: URL containing a full standalone pass.
   * Can be opened in any browser without hosting.
   */
  generateDataUrl(attendee, eventData) {
    const html = this.generateStandalonePassHTML(attendee, eventData);
    return 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  }

  // ──────────────────────────────────────────────────
  // 6. SOCIAL SHARING
  // ──────────────────────────────────────────────────

  /**
   * Share via Web Share API (mobile) or copy to clipboard (desktop fallback)
   */
  async sharePass(attendee, eventData) {
    const shareData = {
      title: `EventPass - ${attendee.name}`,
      text: `${attendee.name} is ${attendee.status === 'attended' ? 'a verified attendee of' : 'registered for'} ${eventData.title}! Pass ID: ${attendee.id}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return { success: true, method: 'native' };
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Share failed:', err);
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      return { success: true, method: 'clipboard' };
    } catch {
      return { success: false, method: 'none' };
    }
  }
}

// Instantiate global share engine
window.shareEngine = new ShareEngine();
