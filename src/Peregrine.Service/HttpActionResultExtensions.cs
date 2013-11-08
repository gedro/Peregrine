﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Peregrine.Service
{
	public static class HttpActionResultExtensions
	{
		public static IHttpActionResult AsResource(this IHttpActionResult that, HttpControllerContext controllerContext, IEnumerable<KeyValuePair<string, Uri>> relatedResources = null)
		{
			return new ResourceActionResult(controllerContext, that, relatedResources);
		}
	}
}